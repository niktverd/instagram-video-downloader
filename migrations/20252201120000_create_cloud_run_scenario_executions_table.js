exports.up = async function (knex) {
    await knex.schema.createTable('cloudRunScenarioExecutions', function (table) {
        table.increments('id').primary();
        table.string('messageId').notNullable();
        table.string('accountId').nullable().defaultTo(null);
        table.string('scenarioId').nullable().defaultTo(null);
        table.string('sourceId').nullable().defaultTo(null);
        table
            .enu('status', ['in-progress', 'success', 'fail', 'cancelled', 'timeout'])
            .notNullable()
            .defaultTo('in-progress');
        table.string('reqId').nullable().defaultTo(null);
        table.integer('attempt').nullable().defaultTo(null);
        table.string('queueName').nullable().defaultTo(null);
        table.string('traceId').nullable().defaultTo(null);
        table.text('errorDetails').nullable().defaultTo(null);
        table.string('artifactPath').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('startedAt').defaultTo(knex.fn.now());
        table.timestamp('finishedAt').nullable().defaultTo(null);
        table.integer('duration').nullable().defaultTo(null); // ms
        table.boolean('cancelled').defaultTo(false);
        table.string('userId').nullable().defaultTo(null);
        table.index(['messageId', 'attempt']);
        table.index(['accountId', 'scenarioId', 'sourceId']);
        table.index(['status']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('cloudRunScenarioExecutions');
};
