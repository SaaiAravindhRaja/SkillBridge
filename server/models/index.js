const User = require('./User');
const HelpRequest = require('./HelpRequest');
const Session = require('./Session');
const Message = require('./Message');

// Define associations
User.hasMany(HelpRequest, { foreignKey: 'kidId', as: 'helpRequests' });
User.hasMany(HelpRequest, { foreignKey: 'volunteerId', as: 'volunteerRequests' });
User.hasMany(Session, { foreignKey: 'kidId', as: 'kidSessions' });
User.hasMany(Session, { foreignKey: 'volunteerId', as: 'volunteerSessions' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });

HelpRequest.belongsTo(User, { foreignKey: 'kidId', as: 'kid' });
HelpRequest.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });
HelpRequest.hasOne(Session, { foreignKey: 'requestId', as: 'session' });

Session.belongsTo(HelpRequest, { foreignKey: 'requestId', as: 'request' });
Session.belongsTo(User, { foreignKey: 'kidId', as: 'kid' });
Session.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });
Session.hasMany(Message, { foreignKey: 'sessionId', as: 'sessionMessages' });

Message.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = {
  User,
  HelpRequest,
  Session,
  Message
};