import {BaseModel} from './BaseModel';

import {IInstagramLocation} from '#src/types/instagramLocation';

export class InstagramLocation extends BaseModel implements IInstagramLocation {
    id!: number;
    externalId!: string;
    externalIdSource?: string;
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    group?: string;
    createdAt!: string;
    updatedAt!: string;

    static get tableName() {
        return 'instagramLocations';
    }

    static get idColumn() {
        return 'id';
    }
}

export default InstagramLocation;
