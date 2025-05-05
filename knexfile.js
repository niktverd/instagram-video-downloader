// Update with your config settings.
require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
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
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
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
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
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
            max: 100,
        },
    },
};
