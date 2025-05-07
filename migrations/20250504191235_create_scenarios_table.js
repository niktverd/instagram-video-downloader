/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('scenarios', function (table) {
        table.increments('id').primary();
        table.string('slug').notNullable().unique();
        table.string('type').notNullable();
        table.boolean('enabled').defaultTo(true);
        table.integer('copied_from').references('id').inTable('scenarios').nullable();
        table.jsonb('options').defaultTo('{}');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('scenarios');
};
