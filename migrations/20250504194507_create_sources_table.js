/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('sources', function (table) {
        table.increments('id').primary();
        table.text('firebaseUrl').nullable();
        table.text('sender').nullable();
        table.text('recipient').nullable();
        table.jsonb('sources').defaultTo('{}');
        table.jsonb('bodyJSONString').nullable();
        table.float('duration').nullable();
        table.integer('attempt').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('lastUsed').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('sources');
};
