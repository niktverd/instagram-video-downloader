/* eslint-disable valid-jsdoc */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('instagramMediaContainers', function (table) {
        table.increments('id').primary();
        table
            .integer('preparedVideoId')
            .references('id')
            .inTable('preparedVideos')
            .onDelete('CASCADE');
        table.string('lastCheckedIGStatus').defaultTo('unknown');
        table.boolean('isPublished').defaultTo(false);
        table.integer('attempts').defaultTo(0);
        table.string('error').nullable().defaultTo(null);
        table.string('containerId').nullable().defaultTo(null);
        table.string('mediaId').nullable().defaultTo(null);
        table.string('caption').nullable().defaultTo(null);
        table.string('audioName').nullable().defaultTo(null);
        table.jsonb('location').nullable().defaultTo(null);
        table.jsonb('hashtags').nullable().defaultTo(null);
        table.boolean('isBlocked').defaultTo(false);
        table.string('blockedReason').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('instagramMediaContainers');
};
