const express = require('express');
const { HelpRequest, User } = require('../models');
const auth = require('../middleware/auth');
const { helpRequestValidation } = require('../middleware/validation');
const router = express.Router();

// Create help request (kids only)
router.post('/', auth, helpRequestValidation, async (req, res) => {
  try {
    if (req.user.userType !== 'kid') {
      return res.status(403).json({ error: 'Only kids can create help requests' });
    }
    
    const { subject, type, description, preferredTime } = req.body;
    
    const helpRequest = await HelpRequest.create({
      kidId: req.user.userId,
      subject,
      type,
      description,
      preferredTime: new Date(preferredTime)
    });
    
    const requestWithKid = await HelpRequest.findByPk(helpRequest.id, {
      include: [{
        model: User,
        as: 'kid',
        attributes: ['name', 'grade', 'school']
      }]
    });
    
    res.status(201).json(requestWithKid);
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
    
    const requests = await HelpRequest.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'kid',
        attributes: ['name', 'grade', 'school']
      }],
      order: [['createdAt', 'DESC']]
    });
    
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
    
    const request = await HelpRequest.findByPk(req.params.id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Request not found or already accepted' });
    }
    
    await request.update({
      status: 'accepted',
      volunteerId: req.user.userId
    });
    
    const updatedRequest = await HelpRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'kid', attributes: ['name', 'grade', 'school'] },
        { model: User, as: 'volunteer', attributes: ['name', 'university'] }
      ]
    });
    
    res.json(updatedRequest);
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
      requests = await HelpRequest.findAll({
        where: { kidId: req.user.userId },
        include: [{
          model: User,
          as: 'volunteer',
          attributes: ['name', 'university']
        }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      requests = await HelpRequest.findAll({
        where: { volunteerId: req.user.userId },
        include: [{
          model: User,
          as: 'kid',
          attributes: ['name', 'grade', 'school']
        }],
        order: [['createdAt', 'DESC']]
      });
    }
    
    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;