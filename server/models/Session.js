const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpRequest',
    required: true
  },
  kidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'image'],
      default: 'text'
    }
  }],
  feedback: {
    kidRating: Number,
    volunteerRating: Number,
    kidFeedback: String,
    volunteerFeedback: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);