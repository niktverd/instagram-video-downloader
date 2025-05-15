import {
    createAccount,
    deleteAccount,
    getAccountById,
    getAccountBySlug,
    getAllAccounts,
    updateAccount,
    wrapper,
} from '../../../db';

import {
    CreateAccountParamsSchema,
    DeleteAccountParamsSchema,
    GetAccountByIdParamsSchema,
    GetAccountBySlugParamsSchema,
    GetAllAccountsParamsSchema,
    UpdateAccountParamsSchema,
} from '#schemas/handlers/account';
import {
    CreateAccountParams,
    CreateAccountResponse,
    DeleteAccountParams,
    DeleteAccountResponse,
    GetAccountByIdParams,
    GetAccountByIdResponse,
    GetAccountBySlugParams,
    GetAccountBySlugResponse,
    GetAllAccountsParams,
    GetAllAccountsResponse,
    UpdateAccountParams,
    UpdateAccountResponse,
} from '#types';

export const createAccountPost = wrapper<CreateAccountParams, CreateAccountResponse>(
    createAccount,
    CreateAccountParamsSchema,
    'POST',
);

export const updateAccountPatch = wrapper<UpdateAccountParams, UpdateAccountResponse>(
    updateAccount,
    UpdateAccountParamsSchema,
    'PATCH',
);

export const getAccountByIdGet = wrapper<GetAccountByIdParams, GetAccountByIdResponse>(
    getAccountById,
    GetAccountByIdParamsSchema,
    'GET',
);

export const getAccountBySlugGet = wrapper<GetAccountBySlugParams, GetAccountBySlugResponse>(
    getAccountBySlug,
    GetAccountBySlugParamsSchema,
    'GET',
);

export const getAllAccountsGet = wrapper<GetAllAccountsParams, GetAllAccountsResponse>(
    getAllAccounts,
    GetAllAccountsParamsSchema,
    'GET',
);

export const deleteAccountDelete = wrapper<DeleteAccountParams, DeleteAccountResponse>(
    deleteAccount,
    DeleteAccountParamsSchema,
    'DELETE',
);
