const User = require('./User');
const HelpRequest = require('./HelpRequest');
const Session = require('./Session');

// Define associations
User.hasMany(HelpRequest, { foreignKey: 'kidId', as: 'helpRequests' });
User.hasMany(HelpRequest, { foreignKey: 'volunteerId', as: 'volunteerRequests' });
User.hasMany(Session, { foreignKey: 'kidId', as: 'kidSessions' });
User.hasMany(Session, { foreignKey: 'volunteerId', as: 'volunteerSessions' });

HelpRequest.belongsTo(User, { foreignKey: 'kidId', as: 'kid' });
HelpRequest.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });
HelpRequest.hasOne(Session, { foreignKey: 'requestId', as: 'session' });

Session.belongsTo(HelpRequest, { foreignKey: 'requestId', as: 'request' });
Session.belongsTo(User, { foreignKey: 'kidId', as: 'kid' });
Session.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });

module.exports = {
  User,
  HelpRequest,
  Session
};