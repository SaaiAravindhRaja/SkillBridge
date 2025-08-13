const express = require('express');
const Session = require('../models/Session');
const HelpRequest = require('../models/HelpRequest');
const auth = require('../middleware/auth');
const router = express.Router();

// Create session from accepted request
router.post('/', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const request = await HelpRequest.findById(requestId);
    if (!request || request.status !== 'accepted') {
      return res.status(404).json({ error: 'Request not found or not accepted' });
    }
    
    // Check if user is involved in this request
    if (request.kidId.toString() !== req.user.userId && 
        request.volunteerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    const session = new Session({
      requestId: request._id,
      kidId: request.kidId,
      volunteerId: request.volunteerId,
      scheduledTime: request.preferredTime
    });
    
    await session.save();
    
    // Update request with session ID
    request.sessionId = session._id;
    await request.save();
    
    await session.populate(['kidId', 'volunteerId']);
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get user's sessions
router.get('/my', auth, async (req, res) => {
  try {
    const query = req.user.userType === 'kid' 
      ? { kidId: req.user.userId }
      : { volunteerId: req.user.userId };
    
    const sessions = await Session.find(query)
      .populate('kidId', 'name grade school')
      .populate('volunteerId', 'name university')
      .populate('requestId', 'subject type description')
      .sort({ scheduledTime: -1 });
    
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
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId.toString() !== req.user.userId && 
        session.volunteerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    session.messages.push({
      senderId: req.user.userId,
      message,
      type
    });
    
    await session.save();
    await session.populate(['kidId', 'volunteerId']);
    
    res.json(session);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Submit feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is part of this session
    if (session.kidId.toString() !== req.user.userId && 
        session.volunteerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }
    
    // Update feedback based on user type
    if (req.user.userType === 'kid') {
      session.feedback.kidRating = rating;
      session.feedback.kidFeedback = feedback;
    } else {
      session.feedback.volunteerRating = rating;
      session.feedback.volunteerFeedback = feedback;
    }
    
    // Mark session as completed if both have provided feedback
    if (session.feedback.kidRating && session.feedback.volunteerRating) {
      session.status = 'completed';
    }
    
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;