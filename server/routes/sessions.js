import express from 'express';
import { Session, HelpRequest, User, Message } from '../models/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// We don't need a separate create session endpoint since it's handled in request acceptance

// Get user's sessions
router.get('/my', auth, async (req, res) => {
  try {
    console.log('Getting sessions for user:', req.user);
    
    // Check if using the correct property name (userType vs user_type, userId vs id)
    const userType = req.user.userType || req.user.user_type;
    const userId = req.user.userId || req.user.id;
    
    if (!userType || !userId) {
      console.error('Missing user info in token:', req.user);
      return res.status(401).json({ error: 'User information not found in token' });
    }
    
    console.log(`Finding sessions for ${userType} with ID: ${userId}`);
    
    let sessions;
    
    if (userType === 'kid') {
      sessions = await Session.findByKidId(userId);
    } else {
      sessions = await Session.findByVolunteerId(userId);
    }
    
    // Check if we have sessions in the database
    console.log(`Found ${sessions.length} sessions for user`);
    console.log('Session statuses:', sessions.map(s => s.status));
    
    // Make sure to normalize the sessions before sending
    const normalizedSessions = sessions.map(session => {
      // Make sure the status is one of the expected values
      if (!['scheduled', 'active', 'completed', 'cancelled'].includes(session.status)) {
        session.status = 'scheduled'; // Default to scheduled if status is unexpected
      }
      return session;
    });
    
    res.json(normalizedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Add message to session
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kid_id !== req.user.userId && 
        session.volunteer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    // Create message in database
    const newMessage = await Message.createMessage(
      session.id,
      req.user.userId,
      message,
      type
    );
    
    // Get message with sender info
    const [messageWithSender] = await Message.query(
      `SELECT m.*, u.name AS sender_name, u.user_type AS sender_type 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = $1`,
      [newMessage.id]
    );
    
    res.json(messageWithSender);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get session messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kid_id !== req.user.userId && 
        session.volunteer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    const messages = await Message.findBySessionId(req.params.id);
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update session status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'active', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kid_id !== req.user.userId && 
        session.volunteer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    // Add timestamps for certain status changes
    const updates = { status };
    
    if (status === 'active') {
      updates.start_time = new Date();
    } else if (status === 'completed' || status === 'cancelled') {
      updates.end_time = new Date();
    }
    
    await Session.update(req.params.id, updates);
    
    res.json({ message: 'Session status updated', status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// Submit feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kid_id !== req.user.userId && 
        session.volunteer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    let updatedSession;
    
    // Update feedback based on user type
    if (req.user.userType === 'kid') {
      updatedSession = await Session.submitFeedback(
        session.id, 'kid', req.user.userId, rating, feedback
      );
    } else {
      updatedSession = await Session.submitFeedback(
        session.id, 'volunteer', req.user.userId, rating, feedback
      );
    }
    
    // Check if both parties have submitted feedback to mark as completed
    if ((session.kid_rating || req.user.userType === 'kid') && 
        (session.volunteer_rating || req.user.userType === 'volunteer')) {
      await Session.update(session.id, { status: 'completed' });
      
      // Update user ratings
      await User.updateRating(session.kid_id);
      await User.updateRating(session.volunteer_id);
    }
    
    // Get the fresh session data
    const freshSession = await Session.findById(session.id);
    res.json(freshSession);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get session details
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kid_id !== req.user.userId && 
        session.volunteer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    // Get help request details
    const [requestDetails] = await HelpRequest.query(
      `SELECT subject, type, description FROM help_requests WHERE id = $1`,
      [session.request_id]
    );
    
    // Get user details
    const kid = await User.findById(session.kid_id);
    const volunteer = await User.findById(session.volunteer_id);
    
    const sessionWithDetails = {
      ...session,
      subject: requestDetails.subject,
      type: requestDetails.type,
      description: requestDetails.description,
      kid_name: kid.name,
      kid_school: kid.school,
      kid_grade: kid.grade,
      volunteer_name: volunteer.name,
      volunteer_university: volunteer.university
    };
    
    res.json(sessionWithDetails);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

export default router;