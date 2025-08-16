const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const authValidation = [
  body('googleId').notEmpty().withMessage('Google ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('userType').isIn(['kid', 'volunteer']).withMessage('User type must be kid or volunteer'),
  validate
];

// Help request validation rules
const helpRequestValidation = [
  body('subject').isIn(['Math', 'Science', 'English', 'History', 'Computer Science', 'Other'])
    .withMessage('Invalid subject'),
  body('type').isIn(['Homework', 'Concept Understanding', 'Test Prep', 'General Help'])
    .withMessage('Invalid help type'),
  body('description').isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters'),
  body('preferredTime').isISO8601().withMessage('Valid date/time is required'),
  validate
];

// Message validation rules
const messageValidation = [
  body('message').isLength({ min: 1, max: 1000 })
    .withMessage('Message must be 1-1000 characters'),
  body('type').optional().isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
  validate
];

// Profile update validation rules
const profileUpdateValidation = [
  body('name').optional().isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('school').optional().isLength({ min: 2, max: 200 })
    .withMessage('School name must be 2-200 characters'),
  body('university').optional().isLength({ min: 2, max: 200 })
    .withMessage('University name must be 2-200 characters'),
  body('subjects').optional().isArray()
    .withMessage('Subjects must be an array'),
  validate
];

module.exports = {
  validate,
  authValidation,
  helpRequestValidation,
  messageValidation,
  profileUpdateValidation
};