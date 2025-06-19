import {z} from 'zod';

import {
    CreateUserParamsSchema,
    DeleteUserParamsSchema,
    GetAllUsersParamsSchema,
    GetUserByEmailParamsSchema,
    GetUserByIdParamsSchema,
    UpdateUserParamsSchema,
} from '#src/types/schemas/handlers/user';
import {UserSchema} from '#src/types/schemas/models';

export type IUser = z.infer<typeof UserSchema>;

export type CreateUserParams = z.infer<typeof CreateUserParamsSchema>;
export type CreateUserResponse = IUser;

export type GetUserByIdParams = z.infer<typeof GetUserByIdParamsSchema>;
export type GetUserByIdResponse = IUser;

export type GetUserByEmailParams = z.infer<typeof GetUserByEmailParamsSchema>;
export type GetUserByEmailResponse = IUser;

export type GetAllUsersParams = z.infer<typeof GetAllUsersParamsSchema>;
export type GetAllUsersResponse = IUser[];

export type UpdateUserParams = z.infer<typeof UpdateUserParamsSchema>;
export type UpdateUserResponse = IUser;

export type DeleteUserParams = z.infer<typeof DeleteUserParamsSchema>;
export type DeleteUserResponse = number;
