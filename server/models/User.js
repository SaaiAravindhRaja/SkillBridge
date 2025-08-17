import BaseModel from './BaseModel.js';
import db from '../db/index.js';

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return this.findOneBy('email', email);
  }

  async findByGoogleId(googleId) {
    return this.findOneBy('google_id', googleId);
  }

  async findVolunteers() {
    return this.query(
      `SELECT * FROM ${this.table} WHERE user_type = $1 ORDER BY rating DESC`, 
      ['volunteer']
    );
  }

  async findKids() {
    return this.query(
      `SELECT * FROM ${this.table} WHERE user_type = $1 ORDER BY created_at DESC`, 
      ['kid']
    );
  }

  async updateRating(id) {
    // Calculate the new average rating based on sessions
    const result = await db.query(
      `WITH ratings AS (
        SELECT 
          CASE 
            WHEN s.kid_id = $1 THEN s.kid_rating 
            WHEN s.volunteer_id = $1 THEN s.volunteer_rating 
          END AS rating
        FROM sessions s
        WHERE (s.kid_id = $1 OR s.volunteer_id = $1)
          AND (
            (s.kid_id = $1 AND s.volunteer_rating IS NOT NULL) OR
            (s.volunteer_id = $1 AND s.kid_rating IS NOT NULL)
          )
      )
      UPDATE users
      SET rating = COALESCE((SELECT AVG(rating) FROM ratings), 0),
          total_sessions = (
            SELECT COUNT(*) FROM sessions 
            WHERE (kid_id = $1 OR volunteer_id = $1) 
              AND status = 'completed'
          ),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [id]
    );
    
    return result.rows[0];
  }
}

export default new User();