const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'HelpRequests',
      key: 'id'
    }
  },
  kidId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },

  feedback: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true
});

module.exports = Session;