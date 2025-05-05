import {Model} from 'objection';
import {z} from 'zod';

import Scenario from './Scenario';

export class Account extends Model {
    id!: number;
    slug!: string;
    enabled = true;
    token?: string;
    createdAt!: Date;
    updatedAt!: Date;

    // Table name is the only required property
    static get tableName() {
        return 'accounts';
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
                token: {type: ['string', 'null']},
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
            token: z.string().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
        });
    }

    static get relationMappings() {
        return {
            scenarios: {
                relation: Model.ManyToManyRelation,
                modelClass: Scenario,
                join: {
                    from: 'accounts.id',
                    through: {
                        from: 'account_scenarios.account_id',
                        to: 'account_scenarios.scenario_id',
                    },
                    to: 'scenarios.id',
                },
            },
        };
    }
}

export default Account;
