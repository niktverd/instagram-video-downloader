import {z} from 'zod';

import {BaseModel} from './BaseModel';

export class User extends BaseModel {
    id!: number;
    email!: string;
    displayName?: string;
    photoURL?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providerData?: Record<string, any>;
    providerId?: string;
    password!: string;

    // Table name is the only required property
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    // Optional JSON schema for validation
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'email'],
            properties: {
                id: {type: 'string', format: 'uuid'},
                email: {type: 'string'},
                displayName: {type: ['string', 'null']},
                photoURL: {type: ['string', 'null']},
                providerData: {type: ['object', 'null']},
                providerId: {type: ['string', 'null']},
                password: {type: ['string', 'null']},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'},
            },
        };
    }

    // Zod schema for runtime validation
    static get zodSchema() {
        return z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            displayName: z.string().optional(),
            photoURL: z.string().url().optional(),
            providerData: z.record(z.any()).optional(),
            providerId: z.string().optional(),
            password: z.string().optional(),
        });
    }
}

export default User;
