const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

// Import models to ensure associations are set up
require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const sessionRoutes = require('./routes/sessions');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return sequelize.sync({ alter: true }); // Use alter: true for development
  })
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SkillBridge API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});