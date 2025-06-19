import {BaseModel} from './BaseModel';

import {IUser} from '#types';

export class User extends BaseModel implements IUser {
    id!: number;
    email!: string;
    displayName?: string;
    photoURL?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providerData?: Record<string, any>;
    providerId?: string;
    password!: string;

    // Table name is the only required property
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }
}

export default User;
