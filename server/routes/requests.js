const express = require('express');
const HelpRequest = require('../models/HelpRequest');
const auth = require('../middleware/auth');
const router = express.Router();

// Create help request (kids only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'kid') {
      return res.status(403).json({ error: 'Only kids can create help requests' });
    }
    
    const { subject, type, description, preferredTime } = req.body;
    
    const helpRequest = new HelpRequest({
      kidId: req.user.userId,
      subject,
      type,
      description,
      preferredTime: new Date(preferredTime)
    });
    
    await helpRequest.save();
    await helpRequest.populate('kidId', 'name grade school');
    
    res.status(201).json(helpRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create help request' });
  }
});

// Get available requests (volunteers only)
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can view available requests' });
    }
    
    const requests = await HelpRequest.find({ status: 'pending' })
      .populate('kidId', 'name grade school')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept help request (volunteers only)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can accept requests' });
    }
    
    const request = await HelpRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already accepted' });
    }
    
    request.status = 'accepted';
    request.volunteerId = req.user.userId;
    await request.save();
    
    await request.populate(['kidId', 'volunteerId']);
    
    res.json(request);
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Get user's requests
router.get('/my', auth, async (req, res) => {
  try {
    let requests;
    
    if (req.user.userType === 'kid') {
      requests = await HelpRequest.find({ kidId: req.user.userId })
        .populate('volunteerId', 'name university')
        .sort({ createdAt: -1 });
    } else {
      requests = await HelpRequest.find({ volunteerId: req.user.userId })
        .populate('kidId', 'name grade school')
        .sort({ createdAt: -1 });
    }
    
    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;