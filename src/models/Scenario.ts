import {Model} from 'objection';

import {Account} from './Account';
import {BaseModel} from './BaseModel';
import {IScenario} from './types';

import {ScenarioType} from '#schemas/scenario';
export class Scenario extends BaseModel implements IScenario {
    id!: number;
    slug!: string;
    enabled = true;
    onlyOnce!: boolean;
    type!: ScenarioType;
    copiedFrom?: number;
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
            accounts: {
                relation: Model.ManyToManyRelation,
                modelClass: Account,
                join: {
                    from: 'scenarios.id',
                    through: {
                        from: 'account_scenarios.scenarioId',
                        to: 'account_scenarios.accountId',
                    },
                    to: 'accounts.id',
                },
            },
        };
    }
}

export default Scenario;
