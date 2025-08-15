const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.ENUM('kid', 'volunteer'),
    allowNull: false
  },
  // Kid-specific fields
  school: DataTypes.STRING,
  grade: DataTypes.STRING,
  parentContact: DataTypes.STRING,
  
  // Volunteer-specific fields
  university: DataTypes.STRING,
  year: DataTypes.STRING,
  subjects: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Common fields
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = User;