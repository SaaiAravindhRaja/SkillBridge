const express = require('express');
const { User } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['googleId'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.googleId; // Prevent updating googleId
    delete updates.email; // Prevent updating email
    delete updates.id; // Prevent updating id
    
    const [updatedRowsCount] = await User.update(updates, {
      where: { id: req.user.userId }
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['googleId'] }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;