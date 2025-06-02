import dotenv from 'dotenv';
// import * as firebase from 'firebase/app';
import {initializeApp} from 'firebase/app';

import {migrateUsers, validateDatabaseSetup} from '../../utils/migrationHelper';

import {getDb} from '#src/db';

// Load environment variables
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

async function run() {
    const db = getDb();
    try {
        console.log('Starting migration from Firestore to PostgreSQL...');

        // Validate PostgreSQL connection and schema
        const isValid = await validateDatabaseSetup();
        if (!isValid) {
            console.error('Database setup is not valid. Please run migrations first.');
            process.exit(1);
        }

        // Run the migrations
        await migrateUsers();

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await db.destroy();
    }
}

// Run the migration
run();
