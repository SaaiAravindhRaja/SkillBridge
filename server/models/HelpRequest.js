const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  kidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science', 'English', 'History', 'Computer Science', 'Other']
  },
  type: {
    type: String,
    required: true,
    enum: ['Homework', 'Concept Understanding', 'Test Prep', 'General Help']
  },
  description: {
    type: String,
    required: true
  },
  preferredTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);