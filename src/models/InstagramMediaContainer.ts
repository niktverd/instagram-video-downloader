import {BaseModel} from './BaseModel';
import PreparedVideo from './PreparedVideo';
import {IInstagramMediaContainer} from './types';

export class InstagramMediaContainer extends BaseModel implements IInstagramMediaContainer {
    id!: number;
    preparedVideoId!: number;
    accountId!: number;
    lastCheckedIGStatus!: string;
    isPublished!: boolean;
    attempts!: number;
    isBlocked!: boolean;
    blockedReason?: string;

    error?: string;
    containerId?: string;
    mediaId?: string;
    caption?: string;
    audioName?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location?: any;
    hashtags?: string[];

    // Table name is the only required property
    static get tableName() {
        return 'instagramMediaContainers';
    }

    static get idColumn() {
        return 'id';
    }

    // Define relationships with other models
    static get relationMappings() {
        return {
            preparedVideos: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: PreparedVideo,
                join: {
                    from: 'instagramMediaContainers.preparedVideoId',
                    to: 'preparedVideos.id',
                },
            },
        };
    }
}

export default PreparedVideo;
