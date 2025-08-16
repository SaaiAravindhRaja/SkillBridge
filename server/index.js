const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
require('dotenv').config();

// Import models to ensure associations are set up
require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const sessionRoutes = require('./routes/sessions');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/auth/', authLimiter);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.set('io', io);

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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join session room
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    const { sessionId, message, senderId, senderName } = data;
    
    // Broadcast message to all users in the session
    io.to(`session-${sessionId}`).emit('new-message', {
      message,
      senderId,
      senderName,
      timestamp: new Date(),
      type: 'text'
    });
  });

  // Handle session status updates
  socket.on('session-status-update', (data) => {
    const { sessionId, status } = data;
    io.to(`session-${sessionId}`).emit('session-status-changed', { status });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { sessionId, userName } = data;
    socket.to(`session-${sessionId}`).emit('user-typing', { userName });
  });

  socket.on('stop-typing', (data) => {
    const { sessionId } = data;
    socket.to(`session-${sessionId}`).emit('user-stopped-typing');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SkillBridge API is running!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});