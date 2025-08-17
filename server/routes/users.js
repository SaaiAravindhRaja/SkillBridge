import express from 'express';
import { User } from '../models/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user);
    
    // Check if using the correct property name (userId vs id)
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
      console.error('No userId found in request user object:', req.user);
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User profile found:', user);
    
    // Remove sensitive data
    delete user.password;
    delete user.google_id;
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user);
    console.log('Update data:', req.body);
    
    // Check if using the correct property name (userId vs id)
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
      console.error('No userId found in request user object:', req.user);
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const updates = {};
    
    // Only allow certain fields to be updated
    const allowedUpdates = [
      'name', 'school', 'grade', 'parent_contact',
      'university', 'year', 'subjects', 'whatsapp_number'
    ];
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    console.log('Applying updates:', updates);
    
    const updatedUser = await User.update(userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive data
    delete updatedUser.password;
    delete updatedUser.google_id;
    
    console.log('Profile updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all volunteers
router.get('/volunteers', auth, async (req, res) => {
  try {
    const volunteers = await User.findVolunteers();
    res.json(volunteers);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

export default router;