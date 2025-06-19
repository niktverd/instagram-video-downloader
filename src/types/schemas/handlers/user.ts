import {z} from 'zod';

import {UserSchema} from '#src/types/schemas/models';

export const CreateUserParamsSchema = UserSchema.omit({id: true});

export const GetUserByIdParamsSchema = z
    .object({
        id: z.string(),
    })
    .strict();

export const GetUserByEmailParamsSchema = z
    .object({
        email: z.string(),
    })
    .strict();

export const GetAllUsersParamsSchema = z.object({}).strict();

export const UpdateUserParamsSchema = CreateUserParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export const DeleteUserParamsSchema = z
    .object({
        id: z.string(),
    })
    .strict();
