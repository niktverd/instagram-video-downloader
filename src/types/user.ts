import {PartialModelObject} from 'objection';
import {z} from 'zod';

import User from '../models/User';

import {
    CreateUserParamsSchema as _CreateUserParamsSchema,
    DeleteUserParamsSchema as _DeleteUserParamsSchema,
    GetAllUsersParamsSchema as _GetAllUsersParamsSchema,
    GetUserByEmailParamsSchema as _GetUserByEmailParamsSchema,
    GetUserByIdParamsSchema as _GetUserByIdParamsSchema,
    UpdateUserParamsSchema as _UpdateUserParamsSchema,
} from '#schemas/handlers/user';

export type CreateUserParams = z.infer<typeof _CreateUserParamsSchema>;
export type CreateUserResponse = PartialModelObject<User>;

export type GetUserByIdParams = z.infer<typeof _GetUserByIdParamsSchema>;
export type GetUserByIdResponse = PartialModelObject<User>;

export type GetUserByEmailParams = z.infer<typeof _GetUserByEmailParamsSchema>;
export type GetUserByEmailResponse = PartialModelObject<User>;

export type GetAllUsersParams = z.infer<typeof _GetAllUsersParamsSchema>;
export type GetAllUsersResponse = PartialModelObject<User>[];

export type UpdateUserParams = z.infer<typeof _UpdateUserParamsSchema>;
export type UpdateUserResponse = PartialModelObject<User>;

export type DeleteUserParams = z.infer<typeof _DeleteUserParamsSchema>;
export type DeleteUserResponse = number;
