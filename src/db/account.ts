/* eslint-disable @typescript-eslint/no-explicit-any */
import {omit} from 'lodash';
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
    const {availableScenarios, instagramLocations, ...accountParams} = params;

    return await db.transaction(async (trx) => {
        const account = await Account.query(trx).insert(
            omit(accountParams, 'availableScenarios', 'instagramLocations'),
        );

        if (availableScenarios?.length) {
            const rows = availableScenarios.map(({id: scenarioId}) => ({
                accountId: account.id,
                scenarioId,
            }));

            await trx('accountScenarios').insert(rows);
        }

        // Handle instagram locations
        if (instagramLocations?.length) {
            const locationRows = instagramLocations.map(({id: instagramLocationId}) => ({
                accountId: account.id,
                instagramLocationId,
            }));

            await trx('accountInstagramLocations').insert(locationRows);
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
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');

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
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');

    if (!account) {
        throw new Error('Account not found');
    }

    return account;
}

export async function getAllAccounts(
    _params: GetAllAccountsParams,
    trx?: Transaction,
): Promise<GetAllAccountsResponse> {
    const accounts = await Account.query(trx || db)
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');
    return accounts;
}

export async function updateAccount(
    params: UpdateAccountParams,
    trx?: Transaction,
): Promise<Account> {
    const {id, availableScenarios, instagramLocations, ...updateData} = params;

    return await (trx || db).transaction(async (t) => {
        const account = await Account.query(t).patchAndFetchById(
            id,
            omit(updateData, 'availableScenarios', 'instagramLocations'),
        );

        if (!account) {
            throw new Error('Account not found');
        }

        if (availableScenarios) {
            await t('accountScenarios').where({accountId: id}).del();

            if (availableScenarios?.length) {
                const inserts = availableScenarios.map(({id: scenarioId}) => ({
                    accountId: id,
                    scenarioId,
                }));

                await t('accountScenarios').insert(inserts);
            }
        }

        // Handle instagram locations
        if (instagramLocations) {
            await t('accountInstagramLocations').where({accountId: id}).del();

            if (instagramLocations?.length) {
                const locationInserts = instagramLocations.map(({id: instagramLocationId}) => ({
                    accountId: id,
                    instagramLocationId,
                }));

                await t('accountInstagramLocations').insert(locationInserts);
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
