import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { authValidation, googleAuthValidation } from '../middleware/validation.js';
import db from '../db/index.js';

const router = express.Router();

// Register - Email/Password
router.post('/register', authValidation, async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { email, password, name, userType, additionalInfo } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !userType) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name, userType: !!userType });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['kid', 'volunteer'].includes(userType)) {
      console.log('Invalid user type:', userType);
      return res.status(400).json({ error: 'Invalid user type' });
    }
    
    // Check if user with email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const userData = {
      email,
      password: hashedPassword,
      name,
      user_type: userType,
      whatsapp_number: additionalInfo?.whatsappNumber || null
    };
    
    // Add WhatsApp number if provided
    if (additionalInfo?.whatsappNumber) {
      userData.whatsapp_number = additionalInfo.whatsappNumber;
    }
    
    // Add type-specific fields
    if (userType === 'kid') {
      userData.school = additionalInfo?.school || null;
      userData.grade = additionalInfo?.grade || null;
      userData.parent_contact = additionalInfo?.parentContact || null;
    } else if (userType === 'volunteer') {
      userData.university = additionalInfo?.university || null;
      userData.year = additionalInfo?.year || null;
      userData.subjects = additionalInfo?.subjects || [];
    }
    
    console.log('Creating user with data:', {...userData, password: '[REDACTED]'});
      const user = await User.create(userData);
      console.log('User created successfully:', user.id);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, userType: user.user_type },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.user_type
        }
      });
    } catch (error) {
      console.error('Register error details:', error);
      res.status(500).json({ 
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
});

// Login - Email/Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Check if the user has a password (might be a Google user)
    if (!user.password) {
      return res.status(400).json({ error: 'Account exists but requires social login' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Maintain Google auth for backward compatibility
router.post('/google', googleAuthValidation, async (req, res) => {
  try {
    const { googleId, email, name, userType, additionalInfo } = req.body;
    
    // Validate required fields
    if (!googleId || !email || !name || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists by googleId
    let user = await User.findByGoogleId(googleId);
    
    if (!user) {
      // Check if email exists
      user = await User.findByEmail(email);
      
      if (!user) {
        // Create new user
        const userData = {
          google_id: googleId,
          email,
          name,
          user_type: userType
        };
        
        // Add type-specific fields
        if (userType === 'kid') {
          userData.school = additionalInfo?.school || null;
          userData.grade = additionalInfo?.grade || null;
          userData.parent_contact = additionalInfo?.parentContact || null;
        } else if (userType === 'volunteer') {
          userData.university = additionalInfo?.university || null;
          userData.year = additionalInfo?.year || null;
          userData.subjects = additionalInfo?.subjects || [];
        }
        
        user = await User.create(userData);
      } else {
        // Update existing user with Google ID
        user = await User.update(user.id, { google_id: googleId });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Google auth error details:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;