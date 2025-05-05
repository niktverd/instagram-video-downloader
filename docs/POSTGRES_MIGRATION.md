# Migrating from Firebase Firestore to PostgreSQL

This guide explains how to migrate data from Firebase Firestore to PostgreSQL using Knex and Objection.js.

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm
- Firebase project with Firestore data

## Setup Steps

1. **Configure environment variables**

   Create a `.env` file in the project root with the following variables:

   ```
   # PostgreSQL Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_NAME=instagram_downloader

   # Firebase Configuration (for migration)
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   ```

2. **Create the PostgreSQL database**

   ```bash
   createdb instagram_downloader
   ```

   Or use a PostgreSQL client to create the database.

3. **Run database migrations**

   ```bash
   npm run migrate
   ```

   This will create the necessary tables in PostgreSQL.

4. **Migrate data from Firestore**

   ```bash
   npm run migrate:firestore
   ```

   This will transfer all users from Firestore to PostgreSQL.

## Project Structure

- `migrations/` - Contains database migration files
- `src/models/` - Contains Objection.js models
- `src/db/` - Database connection setup
- `src/services/` - Business logic for database operations
- `src/scripts/` - Migration scripts

## Using PostgreSQL in the Application

The application now uses Knex and Objection.js for database operations. Here's a quick example:

```typescript
// Example: Get user by ID
import User from '../models/User';

async function getUserById(id: string) {
  const user = await User.query().findById(id);
  return user;
}
```

## Troubleshooting

- **Connection issues**: Verify your PostgreSQL credentials and ensure the database server is running.
- **Migration failures**: Check the migration logs and ensure your Firestore data is in the expected format.
- **Missing tables**: Run `npm run migrate` to ensure all tables are created.
