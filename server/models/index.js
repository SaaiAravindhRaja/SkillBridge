import User from './User.js';
import HelpRequest from './HelpRequest.js';
import Session from './Session.js';
import Message from './Message.js';

// Note: We no longer need to define associations here since we are using raw SQL
// and our BaseModel class handles the relationships directly in each query

export {
  User,
  HelpRequest,
  Session,
  Message
};