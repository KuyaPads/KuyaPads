const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('pad_versions').del();
  await knex('pad_collaborators').del();
  await knex('pads').del();
  await knex('users').del();

  // Create sample users
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  const users = await knex('users').insert([
    {
      username: 'admin',
      email: 'admin@kuyapads.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User'
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Doe'
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password_hash: hashedPassword,
      first_name: 'Jane',
      last_name: 'Smith'
    }
  ]).returning('*');

  // Create sample pads
  await knex('pads').insert([
    {
      title: 'Welcome to KuyaPads!',
      content: '<h1>Welcome to KuyaPads!</h1><p>This is a collaborative document platform where you can create, edit, and share documents in real-time.</p><p><strong>Features:</strong></p><ul><li>Real-time collaboration</li><li>Rich text editing</li><li>Version history</li><li>Public and private pads</li></ul>',
      owner_id: users[0].id,
      is_public: true
    },
    {
      title: 'Project Planning Document',
      content: '<h2>Project Planning</h2><p>This document outlines our project goals and timeline.</p><p><strong>Goals:</strong></p><ol><li>Complete backend development</li><li>Implement frontend features</li><li>Deploy to production</li></ol>',
      owner_id: users[1].id,
      is_public: false
    },
    {
      title: 'Team Meeting Notes',
      content: '<h2>Meeting Notes - ' + new Date().toLocaleDateString() + '</h2><p><strong>Attendees:</strong> John, Jane, Admin</p><p><strong>Topics Discussed:</strong></p><ul><li>Platform features</li><li>Deployment strategy</li><li>User feedback</li></ul>',
      owner_id: users[2].id,
      is_public: false
    }
  ]);
};