// Update with your config settings.
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const {
    host = 'localhost',
    port = 5432,
    user = 'postgres',
    password = 'postgres',
    database = 'postgres',
} = JSON.parse(process.env.POSTGRES_CONFIG || '{}');
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host,
            port,
            user,
            password,
            database,
            ssl: {rejectUnauthorized: false}, // Add this line
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },

    ['server-production']: {
        client: 'pg',
        connection: {
            host,
            port,
            user,
            password,
            database,
            ssl: {rejectUnauthorized: false}, // Add this line
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
    ['cloud-run']: {
        client: 'pg',
        connection: {
            host,
            port,
            user,
            password,
            database,
            ssl: {rejectUnauthorized: false}, // Add this line
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
        pool: {
            min: 1,
            max: 19,
        },
    },
    test: {
        client: 'pg',
        connection: {
            host,
            port,
            user,
            password,
            database,
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
        pool: {
            min: 1,
            max: 2,
        },
    },
};
