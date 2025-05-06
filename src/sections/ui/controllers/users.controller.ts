import {
    CreateUserParams,
    CreateUserParamsSchema,
    CreateUserResponse,
    UpdateUserParams,
    UpdateUserParamsSchema,
    UpdateUserResponse,
    createUser,
    updateUser,
    wrapper,
} from '../../../db';

export const createUserPost = wrapper<CreateUserParams, CreateUserResponse>(
    createUser,
    CreateUserParamsSchema,
    'POST',
);

export const updateUserPatch = wrapper<UpdateUserParams, UpdateUserResponse>(
    updateUser,
    UpdateUserParamsSchema,
    'PATCH',
);
