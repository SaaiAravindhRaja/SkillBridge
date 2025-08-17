import BaseModel from './BaseModel.js';
import db from '../db/index.js';

class Message extends BaseModel {
  constructor() {
    super('messages');
  }

  async findBySessionId(sessionId) {
    return this.query(
      `SELECT m.*,
        u.name AS sender_name,
        u.user_type AS sender_type
      FROM ${this.table} m
      JOIN users u ON m.sender_id = u.id
      WHERE m.session_id = $1
      ORDER BY m.created_at ASC`,
      [sessionId]
    );
  }

  async markAsRead(messageIds) {
    if (!messageIds.length) return [];
    
    // Create placeholders $1, $2, etc. for the array of IDs
    const placeholders = messageIds.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `UPDATE ${this.table}
       SET is_read = TRUE
       WHERE id IN (${placeholders})
       RETURNING *`,
      messageIds
    );
    
    return result.rows;
  }
  
  async createMessage(sessionId, senderId, message, messageType = 'text') {
    return this.create({
      session_id: sessionId,
      sender_id: senderId,
      message: message,
      message_type: messageType
    });
  }
}

export default new Message();