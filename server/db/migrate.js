import db from './index.js';
import dotenv from 'dotenv';

dotenv.config();

// SQL statements for creating tables
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR UNIQUE,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  user_type VARCHAR NOT NULL CHECK (user_type IN ('kid', 'volunteer')),
  school VARCHAR,
  grade VARCHAR,
  parent_contact VARCHAR,
  university VARCHAR,
  year VARCHAR,
  subjects VARCHAR[],
  whatsapp_number VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sessions INTEGER DEFAULT 0,
  badges VARCHAR[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const createHelpRequestsTable = `
CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES users(id),
  subject VARCHAR NOT NULL CHECK (subject IN ('Math', 'Science', 'English', 'History', 'Computer Science', 'Other')),
  type VARCHAR NOT NULL CHECK (type IN ('Homework', 'Concept Understanding', 'Test Prep', 'General Help')),
  description TEXT NOT NULL,
  preferred_time TIMESTAMPTZ NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  volunteer_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const createSessionsTable = `
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id),
  kid_id UUID NOT NULL REFERENCES users(id),
  volunteer_id UUID NOT NULL REFERENCES users(id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  kid_rating INTEGER CHECK (kid_rating IS NULL OR (kid_rating >= 1 AND kid_rating <= 5)),
  volunteer_rating INTEGER CHECK (volunteer_rating IS NULL OR (volunteer_rating >= 1 AND volunteer_rating <= 5)),
  kid_feedback TEXT,
  volunteer_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  message_type VARCHAR NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

// Function to create tables
async function createTables() {
  try {
    console.log('Creating users table with schema:', createUsersTable);
    await db.query(createUsersTable);
    
    await db.query(createHelpRequestsTable);
    await db.query(createSessionsTable);
    await db.query(createMessagesTable);
    
    // Create indexes for performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_help_requests_kid_id ON help_requests (kid_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_help_requests_volunteer_id ON help_requests (volunteer_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests (status);');
    
    await db.query('CREATE INDEX IF NOT EXISTS idx_sessions_kid_id ON sessions (kid_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_sessions_volunteer_id ON sessions (volunteer_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);');
    
    await db.query('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);');
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Error in database migration:', error);
  }
}

// Add function to drop all tables (for reset)
async function dropTables() {
  try {
    await db.query('DROP TABLE IF EXISTS messages CASCADE;');
    await db.query('DROP TABLE IF EXISTS sessions CASCADE;');
    await db.query('DROP TABLE IF EXISTS help_requests CASCADE;');
    await db.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
}

// If this file is run directly (not imported)
if (process.argv[1] === import.meta.url) {
  const args = process.argv.slice(2);
  
  if (args.includes('--reset')) {
    // Drop and recreate all tables
    dropTables().then(() => createTables());
  } else {
    // Just create the tables
    createTables();
  }
}

export { createTables, dropTables };
