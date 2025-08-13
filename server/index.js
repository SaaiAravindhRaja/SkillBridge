const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const sessionRoutes = require('./routes/sessions');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (fallback to local if no env var)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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