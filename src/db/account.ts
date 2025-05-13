/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';
import {z} from 'zod';

import {Account} from '../models/Account';

import db from './utils';

import {AccountSchema, IAccount} from '#src/models/types';

export const CreateAccountParamsSchema = AccountSchema.omit({id: true});
export type CreateAccountParams = Omit<IAccount, 'id'>;
export type CreateAccountResponse = IAccount;

export async function createAccount(params: CreateAccountParams): Promise<CreateAccountResponse> {
    const {availableScenarios, ...accountParams} = params;

    return await db.transaction(async (trx) => {
        const account = await Account.query(trx).insert(accountParams);

        if (availableScenarios.length > 0) {
            const rows = availableScenarios.map((scenarioId: number) => ({
                accountId: account.id,
                scenarioId,
            }));

            await trx('accountScenarios').insert(rows);
        }

        return account;
    });
}

export const GetAccountByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetAccountByIdParams = z.infer<typeof GetAccountByIdParamsSchema>;
export type GetAccountByIdResponse = IAccount;

export async function getAccountById(
    params: GetAccountByIdParams,
    trx?: Transaction,
): Promise<GetAccountByIdResponse> {
    const account = await Account.query(trx || db)
        .findById(params.id)
        .withGraphFetched('availableScenarios');

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
export type GetAccountBySlugResponse = IAccount;

export async function getAccountBySlug(
    params: GetAccountBySlugParams,
    trx?: Transaction,
): Promise<GetAccountBySlugResponse> {
    const account = await Account.query(trx || db)
        .where('slug', params.slug)
        .first()
        .withGraphFetched('availableScenarios');

    if (!account) {
        throw new Error('Account not found');
    }

    return account;
}

export const GetAllAccountsParamsSchema = z.object({}).strict();
export type GetAllAccountsParams = z.infer<typeof GetAllAccountsParamsSchema>;
export type GetAllAccountsResponse = IAccount[];

export async function getAllAccounts(
    _params: GetAllAccountsParams,
    trx?: Transaction,
): Promise<GetAllAccountsResponse> {
    const accounts = await Account.query(trx || db).withGraphFetched('availableScenarios');
    return accounts;
}

export const UpdateAccountParamsSchema = CreateAccountParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export type UpdateAccountParams = z.infer<typeof UpdateAccountParamsSchema>;
export type UpdateAccountResponse = IAccount;
export async function updateAccount(
    params: UpdateAccountParams,
    trx?: Transaction,
): Promise<Account> {
    const {id, availableScenarios, ...updateData} = UpdateAccountParamsSchema.parse(params);

    return await (trx || db).transaction(async (t) => {
        const account = await Account.query(t).patchAndFetchById(id, updateData);

        if (!account) {
            throw new Error('Account not found');
        }

        if (availableScenarios) {
            await t('accountScenarios').where({accountId: id}).del();

            if (availableScenarios.length > 0) {
                const inserts = availableScenarios.map((scenarioId: number) => ({
                    accountId: id,
                    scenarioId,
                }));

                await t('accountScenarios').insert(inserts);
            }
        }

        return account;
    });
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
