/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.uuid('id').primary();
            table.string('email').unique().notNullable();
            table.string('displayName');
            table.string('photoURL');
            table.jsonb('providerData');
            table.string('providerId');
            table.string('password');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
        .createTable('accounts', function (table) {
            table.increments('id').primary();
            table.string('slug').notNullable().unique();
            table.boolean('enabled').defaultTo(true);
            table.text('token');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('accounts').dropTable('users');
};
