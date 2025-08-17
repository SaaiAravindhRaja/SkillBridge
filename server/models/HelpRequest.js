import BaseModel from './BaseModel.js';
import db from '../db/index.js';

class HelpRequest extends BaseModel {
  constructor() {
    super('help_requests');
  }

  async findByKidId(kidId) {
    return this.query(
      `SELECT hr.*, 
        k.name AS kid_name, 
        v.name AS volunteer_name,
        v.whatsapp_number AS volunteer_whatsapp_number
      FROM ${this.table} hr
      LEFT JOIN users k ON hr.kid_id = k.id
      LEFT JOIN users v ON hr.volunteer_id = v.id
      WHERE hr.kid_id = $1
      ORDER BY hr.created_at DESC`,
      [kidId]
    );
  }

  async findByVolunteerId(volunteerId) {
    return this.query(
      `SELECT hr.*, 
        k.name AS kid_name, 
        k.whatsapp_number AS kid_whatsapp_number,
        v.name AS volunteer_name
      FROM ${this.table} hr
      LEFT JOIN users k ON hr.kid_id = k.id
      LEFT JOIN users v ON hr.volunteer_id = v.id
      WHERE hr.volunteer_id = $1
      ORDER BY hr.created_at DESC`,
      [volunteerId]
    );
  }

  async findAvailable() {
    return this.query(
      `SELECT hr.*, 
        k.name AS kid_name, 
        k.school AS kid_school,
        k.grade AS kid_grade,
        k.whatsapp_number AS kid_whatsapp_number
      FROM ${this.table} hr
      JOIN users k ON hr.kid_id = k.id
      WHERE hr.status = 'pending'
        AND hr.volunteer_id IS NULL
      ORDER BY hr.preferred_time ASC`,
      []
    );
  }

  async acceptRequest(requestId, volunteerId) {
    return db.query(
      `UPDATE ${this.table}
       SET volunteer_id = $1, 
           status = 'accepted',
           updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [volunteerId, requestId]
    );
  }
}

export default new HelpRequest();