import * as path from 'path';

import {Knex, knex} from 'knex';
import {Model} from 'objection';

// Import configuration based on environment
const environment = process.env.APP_ENV || 'development';
const config = require(path.join(__dirname, '../../knexfile'))[environment];

// Initialize knex
console.log('config', config);
const db: Knex = knex(config);

// Bind all Models to the knex instance
Model.knex(db);

export default db;

export async function testConnection(): Promise<boolean> {
    try {
        // Test the connection by getting the current timestamp from the database
        await db.raw('SELECT NOW()');
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

export async function closeConnection(): Promise<void> {
    try {
        await db.destroy();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
        throw error;
    }
}

// Export all database operations
export * from './user';
