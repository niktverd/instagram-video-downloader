import {
    CreateUserParams,
    CreateUserParamsSchema,
    CreateUserResponse,
    createUser as dbCreateUser,
    wrapper,
} from '../../../db';

export const createUser = wrapper<CreateUserParams, CreateUserResponse>(
    dbCreateUser,
    CreateUserParamsSchema,
    'POST',
);
