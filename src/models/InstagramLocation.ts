import {BaseModel} from './BaseModel';

import {IInstagramLocation} from '#src/types/instagramLocation';

export class InstagramLocation extends BaseModel implements IInstagramLocation {
    id!: number;
    externalId!: string;
    externalIdSource?: string | null;
    name?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    group?: string | null;

    static get tableName() {
        return 'instagramLocations';
    }

    static get idColumn() {
        return 'id';
    }
}

export default InstagramLocation;
