import * as path from 'path';

import {Request, Response} from 'express';
import {Knex, knex} from 'knex';
import {Model} from 'objection';
import {z} from 'zod';

import {ThrownError} from '#src/utils/error';
import {logError} from '#utils';

// Import configuration based on environment
const environment = process.env.APP_ENV || 'development';
const config = require(path.join(__dirname, '../../knexfile'))[environment];

// Initialize knex
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

// REST HTTP method type
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// Enhanced wrapper for route handlers with validation and method checking
export const wrapper = <RequestArgs, ResponseArgs>(
    fn: (args: RequestArgs) => Promise<{result: ResponseArgs; code?: number}>,
    validator: z.ZodType<RequestArgs>,
    allowedMethod?: HttpMethod | HttpMethod[],
) => {
    return async (req: Request, res: Response) => {
        try {
            // Check HTTP method if specified
            if (allowedMethod) {
                const methods = Array.isArray(allowedMethod) ? allowedMethod : [allowedMethod];
                if (!methods.includes(req.method as HttpMethod)) {
                    throw new ThrownError(
                        `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`,
                        405,
                    );
                }
            }

            // Validate request using Zod schema based on HTTP method
            try {
                // Use query params for GET and DELETE, body for POST and PUT
                const dataToValidate = ['GET', 'DELETE'].includes(req.method)
                    ? req.query
                    : req.body;

                if (dataToValidate.id) {
                    dataToValidate.id = Number(dataToValidate.id);
                }

                const validatedData = validator.parse(dataToValidate) as RequestArgs;

                const {code = 200, result} = await fn(validatedData);
                res.status(code).json(result);
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw new ThrownError(
                        `Validation failed: ${JSON.stringify(validationError.format())}`,
                        400,
                    );
                }

                throw validationError;
            }
        } catch (error) {
            console.log(req);
            if (error instanceof ThrownError) {
                logError('Error in wrapper:', String(error));
                res.status(error.code).json({error: error.message});
            } else {
                logError('Error in wrapper:', String(error));
                res.status(500).json({error: 'Internal server error: ' + String(error)});
            }
        }
    };
};
