/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {v4 as uuidv4} from 'uuid';

import User from '../models/User';

import db from './index';

interface CreateUserParams {
    email: string;
    displayName?: string;
    photoURL?: string;
    providerData?: Record<string, any>;
    providerId?: string;
    password?: string;
}

interface UpdateUserParams {
    email?: string;
    displayName?: string;
    photoURL?: string;
    providerData?: Record<string, any>;
    providerId?: string;
    password?: string;
}

export async function createUser(params: CreateUserParams, trx?: Transaction): Promise<User> {
    const now = new Date();

    const userData: PartialModelObject<User> = {
        id: uuidv4(),
        email: params.email,
        displayName: params.displayName,
        photoURL: params.photoURL,
        providerData: params.providerData,
        providerId: params.providerId,
        password: params.password,
        createdAt: now.toISOString() as any,
        updatedAt: now.toISOString() as any,
    };

    const user = await User.query(trx || db).insert(userData);
    return user;
}

export async function getUserById(id: string, trx?: Transaction): Promise<User | undefined> {
    const user = await User.query(trx || db).findById(id);
    return user;
}

export async function getUserByEmail(email: string, trx?: Transaction): Promise<User | undefined> {
    const user = await User.query(trx || db)
        .where('email', email)
        .first();

    return user;
}

export async function getAllUsers(trx?: Transaction): Promise<User[]> {
    const users = await User.query(trx || db);
    return users;
}

export async function updateUser(
    id: string,
    params: UpdateUserParams,
    trx?: Transaction,
): Promise<User> {
    const updateData: PartialModelObject<User> = {
        ...params,
        updatedAt: new Date().toISOString() as any,
    };

    const user = await User.query(trx || db).patchAndFetchById(id, updateData);
    return user;
}

export async function deleteUser(id: string, trx?: Transaction): Promise<number> {
    const deletedCount = await User.query(trx || db).deleteById(id);
    return deletedCount;
}
