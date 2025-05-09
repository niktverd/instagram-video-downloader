import {Account} from './Account';
import {BaseModel} from './BaseModel';
import Scenario from './Scenario';
import Source from './Source';

export class PreparedVideo extends BaseModel {
    id!: number;
    firebaseUrl!: string;
    duration?: number;
    scenarioId!: number;
    sourceId!: number;
    accountId!: number;

    // Define relationships
    source?: Source;
    scenario?: Scenario;
    account?: Account;

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
                    from: 'prepared_videos.sourceId',
                    to: 'sources.id',
                },
            },
            scenario: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Scenario,
                join: {
                    from: 'prepared_videos.scenarioId',
                    to: 'scenarios.id',
                },
            },
            account: {
                relation: BaseModel.BelongsToOneRelation,
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
