/* eslint-env jest */
const {execSync} = require('child_process');

const {db} = require('../src/db/utils');

beforeAll(async () => {
    // Откатываем все миграции и накатываем заново
    execSync('npx knex migrate:rollback --all');
    execSync('npx knex migrate:latest');
});

beforeEach(async () => {
    const {rows} = await db.raw(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'knex_%'
  `);

    const tableNames = rows.map((r) => `"${r.tablename}"`).join(', ');

    if (tableNames) {
        await db.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
    }
});

afterAll(async () => {
    await db.destroy();
    if (process.env.NODE_ENV === 'debug') {
        // eslint-disable-next-line no-underscore-dangle
        console.log('HANDLES', process._getActiveHandles());
        // eslint-disable-next-line no-underscore-dangle
        console.log('REQUESTS', process._getActiveRequests());
    }
});
