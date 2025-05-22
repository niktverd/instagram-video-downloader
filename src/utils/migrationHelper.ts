/* eslint-disable valid-jsdoc */
// import * as firebase from 'firebase/app';
import {collection, getDocs, getFirestore} from 'firebase/firestore';

import db from '../db/utils';
import User from '../models/User';

/**
 * Utility function to migrate users from Firestore to PostgreSQL
 */
export async function migrateUsers(): Promise<void> {
    try {
        // Get Firestore database reference
        const firestore = getFirestore();

        // Get all users from Firestore
        const usersSnapshot = await getDocs(collection(firestore, 'users'));

        // Counter for migrated users
        let migratedCount = 0;

        // Transaction to ensure all users are migrated together
        await db.transaction(async (trx) => {
            for (const doc of usersSnapshot.docs) {
                const userData = doc.data();

                // Check if user already exists in PostgreSQL by email
                const existingUser = await User.query(trx)
                    .where('email', '=', userData.email)
                    .first();

                if (!existingUser) {
                    // Create new user in PostgreSQL
                    await User.query(trx).insert({
                        email: userData.email,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL,
                        providerData: userData.providerData,
                        providerId: userData.providerId,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any);

                    migratedCount++;
                }
            }
        });

        console.log(`Migration completed: ${migratedCount} users migrated to PostgreSQL`);
    } catch (error) {
        console.error('Error during user migration:', error);
        throw error;
    }
}

/**
 * Utility function to validate the database connection and schema
 */
export async function validateDatabaseSetup(): Promise<boolean> {
    try {
        // Test database connection
        await db.raw('SELECT 1');

        // Check if users table exists
        const tablesExist = await db.schema.hasTable('users');

        if (!tablesExist) {
            console.warn('Required tables do not exist. Please run migrations.');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Database validation failed:', error);
        return false;
    }
}
