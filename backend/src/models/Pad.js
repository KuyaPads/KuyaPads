const db = require('../config/database');

class Pad {
  static async create(padData) {
    const [pad] = await db('pads').insert(padData).returning('*');
    return pad;
  }

  static async findById(id) {
    return await db('pads')
      .where('id', id)
      .where('is_active', true)
      .first();
  }

  static async findByIdWithOwner(id) {
    return await db('pads')
      .join('users', 'pads.owner_id', 'users.id')
      .select(
        'pads.*',
        'users.username as owner_username',
        'users.first_name as owner_first_name',
        'users.last_name as owner_last_name'
      )
      .where('pads.id', id)
      .where('pads.is_active', true)
      .first();
  }

  static async findByOwner(ownerId) {
    return await db('pads')
      .where('owner_id', ownerId)
      .where('is_active', true)
      .orderBy('updated_at', 'desc');
  }

  static async findPublic() {
    return await db('pads')
      .join('users', 'pads.owner_id', 'users.id')
      .select(
        'pads.id',
        'pads.title',
        'pads.created_at',
        'pads.updated_at',
        'users.username as owner_username'
      )
      .where('pads.is_public', true)
      .where('pads.is_active', true)
      .orderBy('pads.updated_at', 'desc');
  }

  static async findByCollaborator(userId) {
    return await db('pads')
      .join('pad_collaborators', 'pads.id', 'pad_collaborators.pad_id')
      .join('users', 'pads.owner_id', 'users.id')
      .select(
        'pads.*',
        'pad_collaborators.permission',
        'users.username as owner_username'
      )
      .where('pad_collaborators.user_id', userId)
      .where('pads.is_active', true)
      .orderBy('pads.updated_at', 'desc');
  }

  static async update(id, padData) {
    const [pad] = await db('pads')
      .where('id', id)
      .update({ ...padData, updated_at: new Date() })
      .returning('*');
    return pad;
  }

  static async delete(id) {
    return await db('pads')
      .where('id', id)
      .update({ is_active: false, updated_at: new Date() });
  }

  static async addCollaborator(padId, userId, permission = 'write') {
    const [collaborator] = await db('pad_collaborators')
      .insert({
        pad_id: padId,
        user_id: userId,
        permission
      })
      .returning('*');
    return collaborator;
  }

  static async removeCollaborator(padId, userId) {
    return await db('pad_collaborators')
      .where('pad_id', padId)
      .where('user_id', userId)
      .del();
  }

  static async getCollaborators(padId) {
    return await db('pad_collaborators')
      .join('users', 'pad_collaborators.user_id', 'users.id')
      .select(
        'users.id',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.avatar_url',
        'pad_collaborators.permission'
      )
      .where('pad_collaborators.pad_id', padId);
  }

  static async createVersion(versionData) {
    const [version] = await db('pad_versions').insert(versionData).returning('*');
    return version;
  }

  static async getVersions(padId) {
    return await db('pad_versions')
      .join('users', 'pad_versions.created_by', 'users.id')
      .select(
        'pad_versions.*',
        'users.username as created_by_username'
      )
      .where('pad_versions.pad_id', padId)
      .orderBy('pad_versions.created_at', 'desc');
  }
}

module.exports = Pad;