const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authValidation } = require('../middleware/validation');
const router = express.Router();

// Google Auth - simplified for demo
router.post('/google', authValidation, async (req, res) => {
  try {
    console.log('Auth request received:', req.body);
    
    const { googleId, email, name, userType, additionalInfo } = req.body;
    
    // Validate required fields
    if (!googleId || !email || !name || !userType) {
      console.log('Missing required fields:', { googleId: !!googleId, email: !!email, name: !!name, userType: !!userType });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['kid', 'volunteer'].includes(userType)) {
      console.log('Invalid user type:', userType);
      return res.status(400).json({ error: 'Invalid user type' });
    }
    
    // Check if user exists
    let user = await User.findOne({ where: { googleId } });
    console.log('Existing user found:', !!user);
    
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
        userData.school = additionalInfo?.school || '';
        userData.grade = additionalInfo?.grade || '';
        userData.parentContact = additionalInfo?.parentContact || '';
      } else if (userType === 'volunteer') {
        userData.university = additionalInfo?.university || '';
        userData.year = additionalInfo?.year || '';
        userData.subjects = additionalInfo?.subjects || [];
      }
      
      console.log('Creating user with data:', userData);
      user = await User.create(userData);
      console.log('User created successfully:', user.id);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    console.log('Token generated successfully');
    
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
    console.error('Auth error details:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;