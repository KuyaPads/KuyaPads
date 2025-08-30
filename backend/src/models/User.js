const db = require('../config/database');

class User {
  static async create(userData) {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  }

  static async findById(id) {
    return await db('users').where('id', id).first();
  }

  static async findByEmail(email) {
    return await db('users').where('email', email).first();
  }

  static async findByUsername(username) {
    return await db('users').where('username', username).first();
  }

  static async update(id, userData) {
    const [user] = await db('users')
      .where('id', id)
      .update({ ...userData, updated_at: new Date() })
      .returning('*');
    return user;
  }

  static async delete(id) {
    return await db('users').where('id', id).del();
  }

  static async getAll() {
    return await db('users').select('id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'is_active', 'created_at');
  }
}

module.exports = User;