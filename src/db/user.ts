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

export async function deleteUser(id: string, trx?: Transaction): Promise<number> {
    const deletedCount = await User.query(trx || db).deleteById(id);
    return deletedCount;
}
