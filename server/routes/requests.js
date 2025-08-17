import express from 'express';
import { HelpRequest, User, Session } from '../models/index.js';
import auth from '../middleware/auth.js';
import { helpRequestValidation } 
  from '../middleware/validation.js';

const router = express.Router();

// Create help request (kids only)
router.post('/', auth, helpRequestValidation, async (req, res) => {
  try {
    console.log('Creating help request with user:', req.user);
    console.log('Request body:', req.body);
    
    // Check if using the correct property name (userType vs user_type)
    const userType = req.user.userType || req.user.user_type;
    
    if (!userType) {
      console.error('No userType found in request user object:', req.user);
      return res.status(401).json({ error: 'User type not found in token' });
    }
    
    if (userType !== 'kid') {
      return res.status(403).json({ error: 'Only kids can create help requests' });
    }
    
    const { subject, type, description, preferredTime } = req.body;
    
    console.log('Processing help request with data:', {
      subject, type, description, preferredTime,
      preferred_time_parsed: new Date(preferredTime)
    });
    
    const helpRequest = await HelpRequest.create({
      kid_id: req.user.userId,
      subject,
      type,
      description,
      preferred_time: new Date(preferredTime)
    });
    
    // Get kid's name for the response
    const kid = await User.findById(req.user.userId);
    
    const requestWithKid = {
      ...helpRequest,
      kid_name: kid.name,
      kid_school: kid.school,
      kid_grade: kid.grade
    };
    
    res.status(201).json(requestWithKid);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create help request' });
  }
});

// Get available requests (volunteers only)
router.get('/available', auth, async (req, res) => {
  try {
    console.log('Getting available requests for user:', req.user);
    
    // Check if using the correct property name (userType vs user_type)
    const userType = req.user.userType || req.user.user_type;
    
    if (!userType) {
      console.error('No userType found in request user object:', req.user);
      return res.status(401).json({ error: 'User type not found in token' });
    }
    
    if (userType !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can view available requests' });
    }
    
    const requests = await HelpRequest.findAvailable();
    
    console.log('Available requests found:', requests.length);
    
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept help request (volunteers only)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    console.log('Accepting request with ID:', req.params.id);
    console.log('User info:', req.user);
    
    // Check if using the correct property name (userType vs user_type)
    const userType = req.user.userType || req.user.user_type;
    const userId = req.user.userId || req.user.id;
    
    if (!userType || !userId) {
      console.error('Missing user info in request:', req.user);
      return res.status(401).json({ error: 'User information not found in token' });
    }
    
    if (userType !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can accept requests' });
    }
    
    console.log('Finding request by ID:', req.params.id);
    const request = await HelpRequest.findById(req.params.id);
    console.log('Request found:', request);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(409).json({ error: 'Request has already been accepted' });
    }
    
    console.log('Accepting request with volunteer ID:', userId);
    const result = await HelpRequest.acceptRequest(req.params.id, userId);
    
    if (!result.rows || !result.rows[0]) {
      return res.status(409).json({ error: 'Request has already been accepted by another volunteer' });
    }
    
    const acceptedRequest = result.rows[0];
    
    try {
      // Create a session for this accepted request
      console.log('Creating session for accepted request:', acceptedRequest.id);
      
      const session = await Session.createFromHelpRequest(
        acceptedRequest.id,
        acceptedRequest.kid_id,
        userId,
        acceptedRequest.preferred_time || new Date()
      );
      
      console.log('Session created successfully:', session);
      
      // Update the help request with the session ID
      if (session && session.id) {
        await HelpRequest.update(acceptedRequest.id, {
          session_id: session.id
        });
      } else {
        console.error('Session creation failed - session object is invalid:', session);
      }
      
      // Get additional info for the response - handle potential missing users
      const kid = await User.findById(acceptedRequest.kid_id) || { name: 'Unknown', school: '', grade: '' };
      const volunteer = await User.findById(userId) || { name: 'Unknown', university: '' };
      
      const updatedRequest = {
        ...acceptedRequest,
        kid_name: kid.name,
        kid_school: kid.school || '',
        kid_grade: kid.grade || '',
        kid_whatsapp_number: kid.whatsapp_number || '',
        volunteer_whatsapp_number: volunteer.whatsapp_number || '',
        volunteer_name: volunteer.name,
        volunteer_university: volunteer.university || '',
        session_id: session?.id
      };
      
      res.json(updatedRequest);
      
    } catch (sessionError) {
      console.error('Error creating session:', sessionError);
      
      // Even if session creation fails, the request was accepted, so we return success
      // with limited information
      res.json({
        ...acceptedRequest,
        error: 'Request accepted but session creation failed'
      });
    }
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept request', details: error.message });
  }
});

// Get user's requests
router.get('/my', auth, async (req, res) => {
  try {
    console.log('Getting my requests for user:', req.user);
    
    // Check if using the correct property name (userType vs user_type)
    const userType = req.user.userType || req.user.user_type;
    const userId = req.user.userId || req.user.id;
    
    if (!userType || !userId) {
      console.error('Missing user information in token:', req.user);
      return res.status(401).json({ error: 'User information not found in token' });
    }
    
    console.log(`Getting ${userType} requests for user ID: ${userId}`);
    
    let requests;
    
    if (userType === 'kid') {
      requests = await HelpRequest.findByKidId(userId);
    } else {
      requests = await HelpRequest.findByVolunteerId(userId);
    }
    
    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;