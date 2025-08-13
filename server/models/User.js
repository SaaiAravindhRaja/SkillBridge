const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['kid', 'volunteer'],
    required: true
  },
  // Kid-specific fields
  school: String,
  grade: String,
  parentContact: String,
  
  // Volunteer-specific fields
  university: String,
  year: String,
  subjects: [String], // Areas they can help with
  
  // Common fields
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  badges: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);