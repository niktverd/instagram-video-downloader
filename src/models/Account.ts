import {PartialModelObject} from 'objection';

import {BaseModel} from './BaseModel';
import Scenario from './Scenario';
import {IAccount} from './types';

export class Account extends BaseModel implements IAccount {
    id!: number;
    slug!: string;
    enabled!: boolean;
    token?: string;
    userIdIG?: string;
    availableScenarios?: PartialModelObject<Scenario>[];

    static get tableName() {
        return 'accounts';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        return {
            availableScenarios: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Scenario,
                join: {
                    from: 'accounts.id',
                    through: {
                        from: 'accountScenarios.accountId',
                        to: 'accountScenarios.scenarioId',
                    },
                    to: 'scenarios.id',
                },
            },
        };
    }
}
