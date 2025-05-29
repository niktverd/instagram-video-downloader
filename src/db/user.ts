/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import db from './utils';

import {CreateUserParamsSchema, UpdateUserParamsSchema} from '#schemas/handlers/user';
import {User} from '#src/models';
import {IResponse} from '#src/types/common';
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
    IUser,
    UpdateUserParams,
    UpdateUserResponse,
} from '#src/types/user';
import {ThrownError} from '#src/utils/error';

export async function createUser(
    params: CreateUserParams,
    trx?: Transaction,
): IResponse<CreateUserResponse> {
    const paramsValidated = CreateUserParamsSchema.parse(params);

    const userData: Omit<IUser, 'id'> = {
        email: paramsValidated.email,
        displayName: paramsValidated.displayName,
        photoURL: paramsValidated.photoURL,
        providerData: paramsValidated.providerData || null,
        providerId: paramsValidated.providerId || null,
        password: paramsValidated.password,
    };

    const user = await User.query(trx || db).insert(userData);
    return {
        result: user,
        code: 200,
    };
}

export async function getUserById(
    params: GetUserByIdParams,
    trx?: Transaction,
): IResponse<GetUserByIdResponse> {
    const user = await User.query(trx || db).findById(params.id);
    if (!user) {
        throw new ThrownError('User not found', 404);
    }

    return {
        result: user,
        code: 200,
    };
}

export async function getUserByEmail(
    params: GetUserByEmailParams,
    trx?: Transaction,
): IResponse<GetUserByEmailResponse> {
    const user = await User.query(trx || db)
        .where('email', params.email)
        .first();

    if (!user) {
        throw new ThrownError('User not found', 404);
    }

    return {
        result: user,
        code: 200,
    };
}

export async function getAllUsers(
    _params: GetAllUsersParams,
    trx?: Transaction,
): IResponse<GetAllUsersResponse> {
    const users = await User.query(trx || db);

    return {
        result: users,
        code: 200,
    };
}

export async function updateUser(
    params: UpdateUserParams,
    trx?: Transaction,
): IResponse<UpdateUserResponse> {
    const {id, ...updateData} = UpdateUserParamsSchema.parse(params);

    const user = await User.query(trx || db).patchAndFetchById(id, updateData);
    return {
        result: user,
        code: 200,
    };
}

export async function deleteUser(
    params: DeleteUserParams,
    trx?: Transaction,
): IResponse<DeleteUserResponse> {
    const deletedCount = await User.query(trx || db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
}
