import {Model} from 'objection';
import {z} from 'zod';

export class Source extends Model {
    id!: number;
    firebaseUrl!: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sources!: Record<string, any>;
    duration!: number;
    createdAt!: Date;
    updatedAt!: Date;
    lastUsed?: Date;

    // Table name is the only required property
    static get tableName() {
        return 'sources';
    }

    static get idColumn() {
        return 'id';
    }

    // Optional JSON schema for validation
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'firebaseUrl', 'sources', 'duration'],
            properties: {
                id: {type: 'integer'},
                firebaseUrl: {type: 'string'},
                sources: {type: 'object'},
                duration: {type: 'number'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'},
                lastUsed: {type: ['string', 'null'], format: 'date-time'},
            },
        };
    }

    // Zod schema for runtime validation
    static get zodSchema() {
        return z.object({
            id: z.number().int().positive(),
            firebaseUrl: z.string(),
            sources: z.record(z.any()),
            duration: z.number(),
            createdAt: z.date(),
            updatedAt: z.date(),
            lastUsed: z.date().optional(),
        });
    }
}

export default Source;
