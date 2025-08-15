const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Google Auth - simplified for demo
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, userType, additionalInfo } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ where: { googleId } });
    
    if (!user) {
      // Create new user
      const userData = {
        googleId,
        email,
        name,
        userType
      };
      
      // Add type-specific fields
      if (userType === 'kid') {
        userData.school = additionalInfo?.school;
        userData.grade = additionalInfo?.grade;
        userData.parentContact = additionalInfo?.parentContact;
      } else if (userType === 'volunteer') {
        userData.university = additionalInfo?.university;
        userData.year = additionalInfo?.year;
        userData.subjects = additionalInfo?.subjects || [];
      }
      
      user = await User.create(userData);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;