import {Express} from 'express';
import request from 'supertest';

import app from '../../app';
import {
    CreateAccountParams,
    DeleteAccountParams,
    GetAccountByIdParams,
    GetAccountBySlugParams,
    GetAllAccountsParams,
    UpdateAccountParams,
} from '../../src/types/account';

// Minimal valid payload for creating an account
const defaultCreatePayload: CreateAccountParams = {
    slug: 'test-account',
    enabled: true,
    // token is optional, userIdIG is optional
};

export async function createAccountHelper(
    payload: Partial<CreateAccountParams> = defaultCreatePayload,
    testApp: Express = app,
) {
    return request(testApp)
        .post('/api/ui/add-account')
        .send({...defaultCreatePayload, ...payload});
}

export async function getAllAccountsHelper(
    testApp: Express = app,
    query: Partial<GetAllAccountsParams> = {},
) {
    return request(testApp).get('/api/ui/get-accounts').query(query);
}

export async function getAccountByIdHelper(params: GetAccountByIdParams, testApp: Express = app) {
    return request(testApp).get('/api/ui/get-account-by-id').query(params);
}

export async function getAccountBySlugHelper(
    params: GetAccountBySlugParams,
    testApp: Express = app,
) {
    return request(testApp).get('/api/ui/get-account-by-slug').query(params);
}

export async function updateAccountHelper(payload: UpdateAccountParams, testApp: Express = app) {
    return request(testApp).patch('/api/ui/patch-account').send(payload);
}

export async function deleteAccountHelper(params: DeleteAccountParams, testApp: Express = app) {
    return request(testApp).delete('/api/ui/delete-account').query(params);
}
