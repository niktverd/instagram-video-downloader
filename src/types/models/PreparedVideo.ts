import {Account} from './Account';
import {BaseModel} from './BaseModel';
import Scenario from './Scenario';
import Source from './Source';

import {IAccount, IPreparedVideo, IScenario, ISource} from '#types';

export class PreparedVideo extends BaseModel implements IPreparedVideo {
    id!: number;
    firebaseUrl!: string;
    duration?: number;
    scenarioId!: number;
    sourceId!: number;
    accountId!: number;

    // Define relationships
    source?: ISource;
    scenario?: IScenario;
    account?: IAccount;

    // Table name is the only required property
    static get tableName() {
        return 'preparedVideos';
    }

    static get idColumn() {
        return 'id';
    }

    // Define relationships with other models
    static get relationMappings() {
        return {
            source: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Source,
                join: {
                    from: 'preparedVideos.sourceId',
                    to: 'sources.id',
                },
            },
            scenario: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Scenario,
                join: {
                    from: 'preparedVideos.scenarioId',
                    to: 'scenarios.id',
                },
            },
            account: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Account,
                join: {
                    from: 'preparedVideos.accountId',
                    to: 'accounts.id',
                },
            },
        };
    }
}

export default PreparedVideo;
