const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HelpRequest = sequelize.define('HelpRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kidId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.ENUM('Math', 'Science', 'English', 'History', 'Computer Science', 'Other'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Homework', 'Concept Understanding', 'Test Prep', 'General Help'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  preferredTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Sessions',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = HelpRequest;