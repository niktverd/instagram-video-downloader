import {Model} from 'objection';

import {Account} from './Account';
import {BaseModel} from './BaseModel';
import {InstagramLocation} from './InstagramLocation';

import {InstagramLocationSource, ScenarioType} from '#src/types/enums';
import {IInstagramLocation} from '#src/types/instagramLocation';
import {IScenario} from '#types';

export class Scenario extends BaseModel implements IScenario {
    id!: number;
    slug!: string;
    enabled = true;
    onlyOnce!: boolean;
    type!: ScenarioType;
    copiedFrom?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any> = {};
    instagramLocationSource: InstagramLocationSource = InstagramLocationSource.Scenario;

    // to add on request
    instagramLocations?: IInstagramLocation[];

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
                        from: 'accountScenarios.scenarioId',
                        to: 'accountScenarios.accountId',
                    },
                    to: 'accounts.id',
                },
            },
            instagramLocations: {
                relation: Model.ManyToManyRelation,
                modelClass: InstagramLocation,
                join: {
                    from: 'scenarios.id',
                    through: {
                        from: 'scenarioInstagramLocations.scenarioId',
                        to: 'scenarioInstagramLocations.instagramLocationId',
                    },
                    to: 'instagramLocations.id',
                },
            },
        };
    }
}

export default Scenario;
