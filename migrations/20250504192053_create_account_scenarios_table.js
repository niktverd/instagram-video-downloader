/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('account_scenarios', function (table) {
        table.increments('id').primary();
        table
            .integer('account_id')
            .references('id')
            .inTable('accounts')
            .notNullable()
            .onDelete('CASCADE');
        table
            .integer('scenario_id')
            .references('id')
            .inTable('scenarios')
            .notNullable()
            .onDelete('CASCADE');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        // Prevent duplicate associations
        table.unique(['account_id', 'scenario_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('account_scenarios');
};
