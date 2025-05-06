import {
    CreateAccountParams,
    CreateAccountParamsSchema,
    CreateAccountResponse,
    DeleteAccountParams,
    DeleteAccountParamsSchema,
    DeleteAccountResponse,
    GetAccountByIdParams,
    GetAccountByIdParamsSchema,
    GetAccountByIdResponse,
    GetAccountBySlugParams,
    GetAccountBySlugParamsSchema,
    GetAccountBySlugResponse,
    GetAllAccountsParams,
    GetAllAccountsParamsSchema,
    GetAllAccountsResponse,
    UpdateAccountParams,
    UpdateAccountParamsSchema,
    UpdateAccountResponse,
    createAccount,
    deleteAccount,
    getAccountById,
    getAccountBySlug,
    getAllAccounts,
    updateAccount,
    wrapper,
} from '../../../db';

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
