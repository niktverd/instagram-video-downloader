import {BaseModel} from './BaseModel';
import {InstagramLocation} from './InstagramLocation';
import Scenario from './Scenario';

import {IAccount} from '#src/types/account';
import {IInstagramLocation} from '#src/types/instagramLocation';
import {IScenario} from '#types';

export class Account extends BaseModel implements IAccount {
    id!: number;
    slug!: string;
    enabled!: boolean;
    token?: string;
    userIdIG?: string | null;

    // to add on request
    availableScenarios?: IScenario[];
    instagramLocations?: IInstagramLocation[];

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
            instagramLocations: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: InstagramLocation,
                join: {
                    from: 'accounts.id',
                    through: {
                        from: 'accountInstagramLocations.accountId',
                        to: 'accountInstagramLocations.instagramLocationId',
                    },
                    to: 'instagramLocations.id',
                },
            },
        };
    }
}
