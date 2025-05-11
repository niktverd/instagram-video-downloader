import {BaseModel} from './BaseModel';

export class Source extends BaseModel {
    id!: number;
    firebaseUrl!: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sources!: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bodyJSONString?: Record<string, any>;
    duration?: number;
    attempt?: number;
    lastUsed?: string;

    static get tableName() {
        return 'sources';
    }

    static get idColumn() {
        return 'id';
    }
}

export default Source;
