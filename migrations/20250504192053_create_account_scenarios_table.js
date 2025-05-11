/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('accountScenarios', function (table) {
        table.increments('id').primary();
        table
            .integer('accountId')
            .references('id')
            .inTable('accounts')
            .notNullable()
            .onDelete('CASCADE');
        table
            .integer('scenarioId')
            .references('id')
            .inTable('scenarios')
            .notNullable()
            .onDelete('CASCADE');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        // Prevent duplicate associations
        table.unique(['accountId', 'scenarioId']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('accountScenarios');
};
