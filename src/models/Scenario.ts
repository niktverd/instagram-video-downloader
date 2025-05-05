import {Model} from 'objection';
import {z} from 'zod';

import Account from './Account';

export class Scenario extends Model {
    id!: number;
    slug!: string;
    enabled = true;
    copied_from?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {};
    createdAt!: Date;
    updatedAt!: Date;

    // Table name is the only required property
    static get tableName() {
        return 'scenarios';
    }

    static get idColumn() {
        return 'id';
    }

    // Optional JSON schema for validation
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'slug'],
            properties: {
                id: {type: 'integer'},
                slug: {type: 'string'},
                enabled: {type: 'boolean', default: true},
                copied_from: {type: ['integer', 'null']},
                options: {type: 'object', default: {}},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'},
            },
        };
    }

    // Zod schema for runtime validation
    static get zodSchema() {
        return z.object({
            id: z.number().int().positive(),
            slug: z.string(),
            enabled: z.boolean().default(true),
            copied_from: z.number().int().positive().nullable().optional(),
            options: z.record(z.any()).default({}),
            createdAt: z.date(),
            updatedAt: z.date(),
        });
    }

    // Define relations to other models
    static get relationMappings() {
        return {
            copiedFrom: {
                relation: Model.BelongsToOneRelation,
                modelClass: Scenario,
                join: {
                    from: 'scenarios.copied_from',
                    to: 'scenarios.id',
                },
            },
            accounts: {
                relation: Model.ManyToManyRelation,
                modelClass: Account,
                join: {
                    from: 'scenarios.id',
                    through: {
                        from: 'account_scenarios.scenario_id',
                        to: 'account_scenarios.account_id',
                    },
                    to: 'accounts.id',
                },
            },
        };
    }
}

export default Scenario;
