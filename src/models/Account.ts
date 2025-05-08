import {BaseModel} from './BaseModel';
import Scenario from './Scenario';

export class Account extends BaseModel {
    id!: number;
    slug!: string;
    enabled!: boolean;
    token?: string;

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
