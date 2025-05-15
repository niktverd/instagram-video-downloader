/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {v4 as uuidv4} from 'uuid';

import User from '../models/User';

import db from './utils';

import {
    CreateUserParamsSchema,
    UpdateUserParamsSchema,
    DeleteUserParamsSchema as _DeleteUserParamsSchema,
    GetAllUsersParamsSchema as _GetAllUsersParamsSchema,
    GetUserByEmailParamsSchema as _GetUserByEmailParamsSchema,
    GetUserByIdParamsSchema as _GetUserByIdParamsSchema,
} from '#schemas/handlers/user';
import {
    CreateUserParams,
    CreateUserResponse,
    DeleteUserParams,
    DeleteUserResponse,
    GetAllUsersParams,
    GetAllUsersResponse,
    GetUserByEmailParams,
    GetUserByEmailResponse,
    GetUserByIdParams,
    GetUserByIdResponse,
    UpdateUserParams,
    UpdateUserResponse as _UpdateUserResponse,
} from '#src/types/user';

export async function createUser(
    params: CreateUserParams,
    trx?: Transaction,
): Promise<CreateUserResponse> {
    const paramsValidated = CreateUserParamsSchema.parse(params);

    const userData: PartialModelObject<User> = {
        id: uuidv4(),
        email: paramsValidated.email,
        displayName: paramsValidated.displayName,
        photoURL: paramsValidated.photoURL,
        providerData: paramsValidated.providerData || null,
        providerId: paramsValidated.providerId || null,
        password: paramsValidated.password,
    };

    const user = await User.query(trx || db).insert(userData);
    return user;
}

export async function getUserById(
    params: GetUserByIdParams,
    trx?: Transaction,
): Promise<GetUserByIdResponse> {
    const user = await User.query(trx || db).findById(params.id);
    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export async function getUserByEmail(
    params: GetUserByEmailParams,
    trx?: Transaction,
): Promise<GetUserByEmailResponse> {
    const user = await User.query(trx || db)
        .where('email', params.email)
        .first();

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export async function getAllUsers(
    _params: GetAllUsersParams,
    trx?: Transaction,
): Promise<GetAllUsersResponse> {
    const users = await User.query(trx || db);
    return users;
}

export async function updateUser(params: UpdateUserParams, trx?: Transaction): Promise<User> {
    const {id, ...updateData} = UpdateUserParamsSchema.parse(params);

    const user = await User.query(trx || db).patchAndFetchById(id, updateData);
    return user;
}

export async function deleteUser(
    params: DeleteUserParams,
    trx?: Transaction,
): Promise<DeleteUserResponse> {
    const deletedCount = await User.query(trx || db).deleteById(params.id);
    return deletedCount;
}
