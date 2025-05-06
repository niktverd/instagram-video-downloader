/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {v4 as uuidv4} from 'uuid';
import {z} from 'zod';

import User from '../models/User';

import db from './utils';

export const CreateUserParamsSchema = z
    .object({
        email: z.string(),
        displayName: z.string().optional(),
        photoURL: z.string().optional(),
        // providerData: z.record(z.any()).optional(),
        // providerId: z.string().optional(),
        providerData: z.any().optional(),
        providerId: z.any().optional(),
        password: z.string(),
    })
    .strict();

export type CreateUserParams = z.infer<typeof CreateUserParamsSchema>;
export type CreateUserResponse = PartialModelObject<User>;

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

export const GetUserByIdParamsSchema = z.object({
    id: z.string(),
});

export type GetUserByIdParams = z.infer<typeof GetUserByIdParamsSchema>;
export type GetUserByIdResponse = PartialModelObject<User>;

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

export const GetUserByEmailParamsSchema = z.object({
    email: z.string(),
});

export type GetUserByEmailParams = z.infer<typeof GetUserByEmailParamsSchema>;
export type GetUserByEmailResponse = PartialModelObject<User>;

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

export const GetAllUsersParamsSchema = z.object({});
export type GetAllUsersParams = z.infer<typeof GetAllUsersParamsSchema>;
export type GetAllUsersResponse = PartialModelObject<User>[];

export async function getAllUsers(
    _params: GetAllUsersParams,
    trx?: Transaction,
): Promise<GetAllUsersResponse> {
    const users = await User.query(trx || db);
    return users;
}

export const UpdateUserParamsSchema = CreateUserParamsSchema.partial().extend({
    id: z.string(),
});

export type UpdateUserParams = z.infer<typeof UpdateUserParamsSchema>;
export type UpdateUserResponse = PartialModelObject<User>;
export async function updateUser(params: UpdateUserParams, trx?: Transaction): Promise<User> {
    const {id, ...updateData} = UpdateUserParamsSchema.parse(params);

    const user = await User.query(trx || db).patchAndFetchById(id, updateData);
    return user;
}

export const DeleteUserParamsSchema = z.object({
    id: z.string(),
});

export type DeleteUserParams = z.infer<typeof DeleteUserParamsSchema>;
export type DeleteUserResponse = number;

export async function deleteUser(
    params: DeleteUserParams,
    trx?: Transaction,
): Promise<DeleteUserResponse> {
    const deletedCount = await User.query(trx || db).deleteById(params.id);
    return deletedCount;
}
