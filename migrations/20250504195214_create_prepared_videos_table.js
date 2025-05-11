/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('preparedVideos', function (table) {
        table.increments('id').primary();
        table.text('firebaseUrl').notNullable();
        table.float('duration').nullable();
        table.integer('scenarioId').references('id').inTable('scenarios').onDelete('CASCADE');
        table.integer('sourceId').references('id').inTable('sources').onDelete('CASCADE');
        table.integer('accountId').references('id').inTable('accounts').onDelete('CASCADE');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('preparedVideos');
};
