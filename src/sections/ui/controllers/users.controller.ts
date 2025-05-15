import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser,
    wrapper,
} from '../../../db';

import {
    CreateUserParamsSchema,
    DeleteUserParamsSchema,
    GetAllUsersParamsSchema,
    GetUserByEmailParamsSchema,
    GetUserByIdParamsSchema,
    UpdateUserParamsSchema,
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
    UpdateUserResponse,
} from '#src/types/user';

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

export const getUserByIdGet = wrapper<GetUserByIdParams, GetUserByIdResponse>(
    getUserById,
    GetUserByIdParamsSchema,
    'GET',
);

export const getUserByEmailGet = wrapper<GetUserByEmailParams, GetUserByEmailResponse>(
    getUserByEmail,
    GetUserByEmailParamsSchema,
    'GET',
);

export const getAllUsersGet = wrapper<GetAllUsersParams, GetAllUsersResponse>(
    getAllUsers,
    GetAllUsersParamsSchema,
    'GET',
);

export const deleteUserDelete = wrapper<DeleteUserParams, DeleteUserResponse>(
    deleteUser,
    DeleteUserParamsSchema,
    'DELETE',
);
