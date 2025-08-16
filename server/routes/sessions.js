const express = require('express');
const { Session, HelpRequest, User, Message } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Create session from accepted request
router.post('/', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const request = await HelpRequest.findByPk(requestId);
    if (!request || request.status !== 'accepted') {
      return res.status(404).json({ error: 'Request not found or not accepted' });
    }
    
    // Check if user is involved in this request
    if (request.kidId !== req.user.userId && 
        request.volunteerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    const session = await Session.create({
      requestId: request.id,
      kidId: request.kidId,
      volunteerId: request.volunteerId,
      scheduledTime: request.preferredTime
    });
    
    // Update request with session ID
    await request.update({ sessionId: session.id });
    
    const sessionWithUsers = await Session.findByPk(session.id, {
      include: [
        { model: User, as: 'kid', attributes: ['name', 'grade', 'school'] },
        { model: User, as: 'volunteer', attributes: ['name', 'university'] }
      ]
    });
    
    res.status(201).json(sessionWithUsers);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get user's sessions
router.get('/my', auth, async (req, res) => {
  try {
    const whereClause = req.user.userType === 'kid' 
      ? { kidId: req.user.userId }
      : { volunteerId: req.user.userId };
    
    const sessions = await Session.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'kid', attributes: ['name', 'grade', 'school'] },
        { model: User, as: 'volunteer', attributes: ['name', 'university'] },
        { model: HelpRequest, as: 'request', attributes: ['subject', 'type', 'description'] }
      ],
      order: [['scheduledTime', 'DESC']]
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Add message to session
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId !== req.user.userId && 
        session.volunteerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    // Create message in database
    const newMessage = await Message.create({
      sessionId: req.params.id,
      senderId: req.user.userId,
      message,
      type
    });
    
    // Get message with sender info
    const messageWithSender = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['name', 'userType'] }
      ]
    });
    
    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    io.to(`session-${req.params.id}`).emit('new-message', {
      id: messageWithSender.id,
      message: messageWithSender.message,
      senderId: messageWithSender.senderId,
      senderName: messageWithSender.sender.name,
      senderType: messageWithSender.sender.userType,
      timestamp: messageWithSender.createdAt,
      type: messageWithSender.type
    });
    
    res.json(messageWithSender);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get session messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId !== req.user.userId && 
        session.volunteerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    const messages = await Message.findAll({
      where: { sessionId: req.params.id },
      include: [
        { model: User, as: 'sender', attributes: ['name', 'userType'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    
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
    
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId !== req.user.userId && 
        session.volunteerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    await session.update({ status });
    
    // Emit status update via Socket.io
    const io = req.app.get('io');
    io.to(`session-${req.params.id}`).emit('session-status-changed', { status });
    
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
    
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId !== req.user.userId && 
        session.volunteerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    const currentFeedback = session.feedback || {};
    
    // Update feedback based on user type
    if (req.user.userType === 'kid') {
      currentFeedback.kidRating = rating;
      currentFeedback.kidFeedback = feedback;
    } else {
      currentFeedback.volunteerRating = rating;
      currentFeedback.volunteerFeedback = feedback;
    }
    
    // Mark session as completed if both have provided feedback
    const status = (currentFeedback.kidRating && currentFeedback.volunteerRating) 
      ? 'completed' 
      : session.status;
    
    await session.update({ 
      feedback: currentFeedback,
      status: status
    });
    
    const updatedSession = await Session.findByPk(req.params.id);
    res.json(updatedSession);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;