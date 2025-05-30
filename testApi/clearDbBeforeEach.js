/* eslint-env jest */
const knex = require('knex')(require('../knexfile').test);

beforeEach(async () => {
    const {rows} = await knex.raw(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'knex_%'
  `);

    const tableNames = rows.map((r) => `"${r.tablename}"`).join(', ');

    if (tableNames) {
        await knex.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
    }
});

afterAll(async () => {
    await knex.destroy();
});
