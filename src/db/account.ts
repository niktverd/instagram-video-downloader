/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {z} from 'zod';

import {Account} from '../models/Account';

import db from './utils';

export const CreateAccountParamsSchema = z
    .object({
        slug: z.string(),
        enabled: z.boolean().optional(),
        token: z.string().optional(),
    })
    .strict();

export type CreateAccountParams = z.infer<typeof CreateAccountParamsSchema>;
export type CreateAccountResponse = PartialModelObject<Account>;

export async function createAccount(
    params: CreateAccountParams,
    trx?: Transaction,
): Promise<CreateAccountResponse> {
    const paramsValidated = CreateAccountParamsSchema.parse(params);

    const accountData: PartialModelObject<Account> = {
        slug: paramsValidated.slug,
        enabled: paramsValidated.enabled ?? true,
        token: paramsValidated.token,
    };

    const account = await Account.query(trx || db).insert(accountData);
    return account;
}

export const GetAccountByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetAccountByIdParams = z.infer<typeof GetAccountByIdParamsSchema>;
export type GetAccountByIdResponse = PartialModelObject<Account>;

export async function getAccountById(
    params: GetAccountByIdParams,
    trx?: Transaction,
): Promise<GetAccountByIdResponse> {
    const account = await Account.query(trx || db).findById(params.id);
    if (!account) {
        throw new Error('Account not found');
    }

    return account;
}

export const GetAccountBySlugParamsSchema = z
    .object({
        slug: z.string(),
    })
    .strict();

export type GetAccountBySlugParams = z.infer<typeof GetAccountBySlugParamsSchema>;
export type GetAccountBySlugResponse = PartialModelObject<Account>;

export async function getAccountBySlug(
    params: GetAccountBySlugParams,
    trx?: Transaction,
): Promise<GetAccountBySlugResponse> {
    const account = await Account.query(trx || db)
        .where('slug', params.slug)
        .first();

    if (!account) {
        throw new Error('Account not found');
    }

    return account;
}

export const GetAllAccountsParamsSchema = z.object({}).strict();
export type GetAllAccountsParams = z.infer<typeof GetAllAccountsParamsSchema>;
export type GetAllAccountsResponse = PartialModelObject<Account>[];

export async function getAllAccounts(
    _params: GetAllAccountsParams,
    trx?: Transaction,
): Promise<GetAllAccountsResponse> {
    const accounts = await Account.query(trx || db);
    return accounts;
}

export const UpdateAccountParamsSchema = CreateAccountParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export type UpdateAccountParams = z.infer<typeof UpdateAccountParamsSchema>;
export type UpdateAccountResponse = PartialModelObject<Account>;
export async function updateAccount(
    params: UpdateAccountParams,
    trx?: Transaction,
): Promise<Account> {
    const {id, ...updateData} = UpdateAccountParamsSchema.parse(params);

    const account = await Account.query(trx || db).patchAndFetchById(id, updateData);
    return account;
}

export const DeleteAccountParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type DeleteAccountParams = z.infer<typeof DeleteAccountParamsSchema>;
export type DeleteAccountResponse = number;

export async function deleteAccount(
    params: DeleteAccountParams,
    trx?: Transaction,
): Promise<DeleteAccountResponse> {
    const deletedCount = await Account.query(trx || db).deleteById(params.id);
    return deletedCount;
}
