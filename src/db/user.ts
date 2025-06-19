/* eslint-disable @typescript-eslint/no-explicit-any */
import {ApiFunctionPrototype} from '#src/types/common';
import {User} from '#src/types/models';
import {CreateUserParamsSchema, UpdateUserParamsSchema} from '#src/types/schemas/handlers/user';
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

export const createUser: ApiFunctionPrototype<CreateUserParams, CreateUserResponse> = async (
    params,
    db,
) => {
    const paramsValidated = CreateUserParamsSchema.parse(params);

    const userData: Omit<IUser, 'id'> = {
        email: paramsValidated.email,
        displayName: paramsValidated.displayName,
        photoURL: paramsValidated.photoURL,
        providerData: paramsValidated.providerData || null,
        providerId: paramsValidated.providerId || null,
        password: paramsValidated.password,
    };

    const user = await User.query(db).insert(userData);
    return {
        result: user,
        code: 200,
    };
};

export const getUserById: ApiFunctionPrototype<GetUserByIdParams, GetUserByIdResponse> = async (
    params,
    db,
) => {
    const user = await User.query(db).findById(params.id);
    if (!user) {
        throw new ThrownError('User not found', 404);
    }

    return {
        result: user,
        code: 200,
    };
};

export const getUserByEmail: ApiFunctionPrototype<
    GetUserByEmailParams,
    GetUserByEmailResponse
> = async (params, db) => {
    const user = await User.query(db).where('email', params.email).first();

    if (!user) {
        throw new ThrownError('User not found', 404);
    }

    return {
        result: user,
        code: 200,
    };
};

export const getAllUsers: ApiFunctionPrototype<GetAllUsersParams, GetAllUsersResponse> = async (
    _params,
    db,
) => {
    const users = await User.query(db);

    return {
        result: users,
        code: 200,
    };
};

export const updateUser: ApiFunctionPrototype<UpdateUserParams, UpdateUserResponse> = async (
    params,
    db,
) => {
    const {id, ...updateData} = UpdateUserParamsSchema.parse(params);

    const user = await User.query(db).patchAndFetchById(id, updateData);
    return {
        result: user,
        code: 200,
    };
};

export const deleteUser: ApiFunctionPrototype<DeleteUserParams, DeleteUserResponse> = async (
    params,
    db,
) => {
    const deletedCount = await User.query(db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
};
