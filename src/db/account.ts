/* eslint-disable @typescript-eslint/no-explicit-any */
import {omit} from 'lodash';

import {Account} from '../models/Account';

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
} from '#src/types/account';
import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';

export const createAccount: ApiFunctionPrototype<
    CreateAccountParams,
    CreateAccountResponse
> = async (params, db) => {
    const {availableScenarios, instagramLocations, ...accountParams} = params;

    const accountPromise = await db.transaction(async (trx) => {
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

    return {
        result: accountPromise,
        code: 200,
    };
};

export const getAccountById: ApiFunctionPrototype<
    GetAccountByIdParams,
    GetAccountByIdResponse
> = async (params, db) => {
    const account = await Account.query(db)
        .findById(params.id)
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');

    if (!account) {
        throw new ThrownError('Account not found', 404);
    }

    return {
        result: account,
        code: 200,
    };
};

export const getAccountBySlug: ApiFunctionPrototype<
    GetAccountBySlugParams,
    GetAccountBySlugResponse
> = async (params, db) => {
    const account = await Account.query(db)
        .where('slug', params.slug)
        .first()
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');

    if (!account) {
        throw new ThrownError('Account not found', 404);
    }

    return {
        result: account,
        code: 200,
    };
};

export const getAllAccounts: ApiFunctionPrototype<
    GetAllAccountsParams,
    GetAllAccountsResponse
> = async (params, db) => {
    const {onlyEnabled = false} = params;
    const query = Account.query(db)
        .withGraphFetched('availableScenarios')
        .withGraphFetched('instagramLocations');

    if (onlyEnabled) {
        query.where('enabled', true);
    }

    const accounts = await query;

    return {
        result: accounts,
        code: 200,
    };
};

export const updateAccount: ApiFunctionPrototype<
    UpdateAccountParams,
    UpdateAccountResponse
> = async (params, db) => {
    const {id, availableScenarios, instagramLocations, ...updateData} = params;

    const accountPromise = await db.transaction(async (t) => {
        const account = await Account.query(t).patchAndFetchById(
            id,
            omit(updateData, 'availableScenarios', 'instagramLocations'),
        );

        if (!account) {
            throw new ThrownError('Account not found', 404);
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

    return {
        result: accountPromise,
        code: 200,
    };
};

export const deleteAccount: ApiFunctionPrototype<
    DeleteAccountParams,
    DeleteAccountResponse
> = async (params, db) => {
    const deletedCount = await Account.query(db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
};
