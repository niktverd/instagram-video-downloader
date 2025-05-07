import {Model} from 'objection';

import {Account} from './Account';
import {BaseModel} from './BaseModel';

import {ScenarioType} from '#schemas/scenario';
export class Scenario extends BaseModel {
    id!: number;
    slug!: string;
    enabled = true;
    type!: ScenarioType;
    copied_from?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {};

    // Table name is the only required property
    static get tableName() {
        return 'scenarios';
    }

    static get idColumn() {
        return 'id';
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
