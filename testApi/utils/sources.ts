import request from 'supertest';

import app from '../../app';
import {DeleteSourceParams, UpdateSourceParams} from '../../src/types/source';

// Default payload for creating a source (customize as needed)
const defaultCreatePayload = {
    sources: {foo: 'bar'},
};

export async function createSourceHelper(payload = defaultCreatePayload, testApp = app) {
    return request(testApp).post('/api/ui/create-source').send(payload);
}

export async function getAllSourcesHelper(testApp = app, query = {}) {
    return request(testApp).get('/api/ui/get-all-sources').query(query);
}

export async function getOneSourceHelper(params = {}, testApp = app) {
    return request(testApp).get('/api/ui/get-one-source').query(params);
}

export async function updateSourceHelper(payload: UpdateSourceParams, testApp = app) {
    return request(testApp).patch('/api/ui/update-source').send(payload);
}

export async function deleteSourceHelper({id}: DeleteSourceParams, testApp = app) {
    return request(testApp).delete('/api/ui/delete-source').query({id});
}
