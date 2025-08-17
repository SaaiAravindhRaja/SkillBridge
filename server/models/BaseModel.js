import db from '../db/index.js';

// Generic CRUD operations that can be used by all models
class BaseModel {
  constructor(table) {
    this.table = table;
  }

  async findAll() {
    const result = await db.query(`SELECT * FROM ${this.table} ORDER BY created_at DESC`);
    return result.rows;
  }

  async findById(id) {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findBy(field, value) {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE ${field} = $1`, [value]);
    return result.rows;
  }

  async findOneBy(field, value) {
    const result = await db.query(`SELECT * FROM ${this.table} WHERE ${field} = $1 LIMIT 1`, [value]);
    return result.rows[0] || null;
  }

  async create(data) {
    // Get all keys from the data object
    const keys = Object.keys(data);
    
    // Create arrays of column names and value placeholders
    const columns = keys.join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const values = keys.map(key => data[key]);
    
    // Perform the insert
    const result = await db.query(
      `INSERT INTO ${this.table} (${columns}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  async update(id, data) {
    // Get all keys from the data object
    const keys = Object.keys(data);
    
    // Create an array of set expressions (column=$n)
    const setExpressions = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...keys.map(key => data[key]), id];
    
    // Perform the update
    const result = await db.query(
      `UPDATE ${this.table} 
       SET ${setExpressions}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(`DELETE FROM ${this.table} WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0] || null;
  }

  async query(sql, params) {
    try {
      console.log(`Executing query on ${this.table}:`, sql.replace(/\s+/g, ' ').trim());
      console.log('Query params:', params);
      const result = await db.query(sql, params);
      console.log(`Query returned ${result.rows.length} rows`);
      return result.rows;
    } catch (error) {
      console.error(`Query error on ${this.table}:`, error);
      throw error;
    }
  }
}

export default BaseModel;
