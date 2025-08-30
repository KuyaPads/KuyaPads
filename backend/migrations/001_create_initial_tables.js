/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.text('avatar_url');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('pads', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('content').defaultTo('');
      table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.boolean('is_public').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.string('password_hash'); // For password-protected pads
      table.timestamps(true, true);
      table.index(['owner_id']);
      table.index(['is_public']);
    })
    .createTable('pad_collaborators', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('pad_id').notNullable().references('id').inTable('pads').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.enum('permission', ['read', 'write', 'admin']).defaultTo('write');
      table.timestamps(true, true);
      table.unique(['pad_id', 'user_id']);
      table.index(['pad_id']);
      table.index(['user_id']);
    })
    .createTable('pad_versions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('pad_id').notNullable().references('id').inTable('pads').onDelete('CASCADE');
      table.text('content').notNullable();
      table.uuid('created_by').notNullable().references('id').inTable('users');
      table.string('change_summary');
      table.timestamps(true, true);
      table.index(['pad_id']);
      table.index(['created_by']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('pad_versions')
    .dropTableIfExists('pad_collaborators')
    .dropTableIfExists('pads')
    .dropTableIfExists('users');
};