const express = require('express');
const { Session, HelpRequest, User } = require('../models');
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
    
    const newMessage = {
      senderId: req.user.userId,
      message,
      type,
      timestamp: new Date()
    };
    
    const currentMessages = session.messages || [];
    currentMessages.push(newMessage);
    
    await session.update({ messages: currentMessages });
    
    const updatedSession = await Session.findByPk(req.params.id, {
      include: [
        { model: User, as: 'kid', attributes: ['name', 'grade', 'school'] },
        { model: User, as: 'volunteer', attributes: ['name', 'university'] }
      ]
    });
    
    res.json(updatedSession);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
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