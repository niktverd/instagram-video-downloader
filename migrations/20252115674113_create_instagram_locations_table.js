/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return (
        knex.schema
            .createTable('instagramLocations', function (table) {
                table.increments('id').primary();
                table.string('externalId').notNullable();
                table.string('externalIdSource').nullable();
                table.string('name').nullable();
                table.string('group').nullable();
                table.string('address').nullable();
                table.float('lat').nullable();
                table.float('lng').nullable();
                table.timestamp('createdAt').defaultTo(knex.fn.now());
                table.timestamp('updatedAt').defaultTo(knex.fn.now());
            })
            // Create a join table for scenarios and instagram locations
            .createTable('scenarioInstagramLocations', function (table) {
                table.increments('id').primary();
                table
                    .integer('scenarioId')
                    .references('id')
                    .inTable('scenarios')
                    .notNullable()
                    .onDelete('CASCADE');
                table
                    .integer('instagramLocationId')
                    .references('id')
                    .inTable('instagramLocations')
                    .notNullable()
                    .onDelete('CASCADE');
                table.timestamp('createdAt').defaultTo(knex.fn.now());
                table.timestamp('updatedAt').defaultTo(knex.fn.now());
                // Prevent duplicate associations
                table.unique(['scenarioId', 'instagramLocationId']);
            })
            // Create a join table for accounts and instagram locations
            .createTable('accountInstagramLocations', function (table) {
                table.increments('id').primary();
                table
                    .integer('accountId')
                    .references('id')
                    .inTable('accounts')
                    .notNullable()
                    .onDelete('CASCADE');
                table
                    .integer('instagramLocationId')
                    .references('id')
                    .inTable('instagramLocations')
                    .notNullable()
                    .onDelete('CASCADE');
                table.timestamp('createdAt').defaultTo(knex.fn.now());
                table.timestamp('updatedAt').defaultTo(knex.fn.now());
                // Prevent duplicate associations
                table.unique(['accountId', 'instagramLocationId']);
            })
            // Add a selector field to scenarios table to determine where to fetch locations from
            .alterTable('scenarios', function (table) {
                table
                    .enum('instagramLocationSource', ['scenario', 'account'])
                    .defaultTo('scenario');
            })
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .alterTable('scenarios', function (table) {
            table.dropColumn('instagramLocationSource');
        })
        .dropTable('accountInstagramLocations')
        .dropTable('scenarioInstagramLocations')
        .dropTable('instagramLocations');
};
