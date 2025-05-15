/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import {Account} from '../models/Account';

import db from './utils';

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
} from '#src/types/account';

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

export async function getAllAccounts(
    _params: GetAllAccountsParams,
    trx?: Transaction,
): Promise<GetAllAccountsResponse> {
    const accounts = await Account.query(trx || db).withGraphFetched('availableScenarios');
    return accounts;
}

export async function updateAccount(
    params: UpdateAccountParams,
    trx?: Transaction,
): Promise<Account> {
    const {id, availableScenarios, ...updateData} = params;

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

export async function deleteAccount(
    params: DeleteAccountParams,
    trx?: Transaction,
): Promise<DeleteAccountResponse> {
    const deletedCount = await Account.query(trx || db).deleteById(params.id);
    return deletedCount;
}
