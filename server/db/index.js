import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Only set to false if you're connecting to a server with a self-signed certificate
  }
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('Connected to Neon PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err);
  });

export default {
  query: (text, params) => pool.query(text, params)
};
