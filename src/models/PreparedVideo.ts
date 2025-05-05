import {Model} from 'objection';
import {z} from 'zod';

import Account from './Account';
import Scenario from './Scenario';
import Source from './Source';

export class PreparedVideo extends Model {
    id!: number;
    firebaseUrl!: string;
    duration?: number;
    scenarioId!: number;
    sourceId!: number;
    accountId!: number;
    createdAt!: Date;
    updatedAt!: Date;

    // Define relationships
    source?: Source;
    scenario?: Scenario;
    account?: Account;

    // Table name is the only required property
    static get tableName() {
        return 'prepared_videos';
    }

    static get idColumn() {
        return 'id';
    }

    // Optional JSON schema for validation
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['firebaseUrl', 'scenarioId', 'sourceId', 'accountId'],
            properties: {
                id: {type: 'integer'},
                firebaseUrl: {type: 'string'},
                duration: {type: ['number', 'null']},
                scenarioId: {type: 'integer'},
                sourceId: {type: 'integer'},
                accountId: {type: 'integer'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'},
            },
        };
    }

    // Zod schema for runtime validation
    static get zodSchema() {
        return z.object({
            id: z.number().int().positive(),
            firebaseUrl: z.string(),
            duration: z.number().optional(),
            scenarioId: z.number().int().positive(),
            sourceId: z.number().int().positive(),
            accountId: z.number().int().positive(),
            createdAt: z.date(),
            updatedAt: z.date(),
        });
    }

    // Define relationships with other models
    static get relationMappings() {
        return {
            source: {
                relation: Model.BelongsToOneRelation,
                modelClass: Source,
                join: {
                    from: 'prepared_videos.sourceId',
                    to: 'sources.id',
                },
            },
            scenario: {
                relation: Model.BelongsToOneRelation,
                modelClass: Scenario,
                join: {
                    from: 'prepared_videos.scenarioId',
                    to: 'scenarios.id',
                },
            },
            account: {
                relation: Model.BelongsToOneRelation,
                modelClass: Account,
                join: {
                    from: 'prepared_videos.accountId',
                    to: 'accounts.id',
                },
            },
        };
    }
}

export default PreparedVideo;
