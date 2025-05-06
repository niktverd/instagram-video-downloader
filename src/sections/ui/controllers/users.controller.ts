import {
    CreateUserParams,
    CreateUserParamsSchema,
    CreateUserResponse,
    DeleteUserParams,
    DeleteUserParamsSchema,
    DeleteUserResponse,
    GetAllUsersParams,
    GetAllUsersParamsSchema,
    GetAllUsersResponse,
    GetUserByEmailParams,
    GetUserByEmailParamsSchema,
    GetUserByEmailResponse,
    GetUserByIdParams,
    GetUserByIdParamsSchema,
    GetUserByIdResponse,
    UpdateUserParams,
    UpdateUserParamsSchema,
    UpdateUserResponse,
    createUser,
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserById,
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
