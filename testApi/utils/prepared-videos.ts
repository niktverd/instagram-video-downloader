import {Express} from 'express';
import request from 'supertest';

import app from '../../app';
import {
    CreatePreparedVideoParams,
    DeletePreparedVideoParams,
    GetAllPreparedVideosParams,
    GetPreparedVideoByIdParams,
    UpdatePreparedVideoParams,
} from '../../src/types/preparedVideo';

// Minimal valid payload for creating a prepared video
export const buildPreparedVideoPayload = (ids: {
    scenarioId: number;
    sourceId: number;
    accountId: number;
}): CreatePreparedVideoParams => ({
    firebaseUrl: 'https://dummy.firebase.com/video.mp4',
    scenarioId: ids.scenarioId,
    sourceId: ids.sourceId,
    accountId: ids.accountId,
});

export async function createPreparedVideoHelper(
    payload: CreatePreparedVideoParams,
    testApp: Express = app,
) {
    return request(testApp).post('/api/ui/add-prepared-video').send(payload);
}

export async function getAllPreparedVideosHelper(
    testApp: Express = app,
    query: Partial<GetAllPreparedVideosParams> = {},
) {
    return request(testApp).get('/api/ui/get-all-prepared-videos').query(query);
}

export async function getPreparedVideoByIdHelper(
    params: GetPreparedVideoByIdParams,
    testApp: Express = app,
) {
    return request(testApp).get('/api/ui/get-prepared-video-by-id').query(params);
}

export async function updatePreparedVideoHelper(
    payload: UpdatePreparedVideoParams,
    testApp: Express = app,
) {
    return request(testApp).patch('/api/ui/patch-prepared-video').send(payload);
}

export async function deletePreparedVideoHelper(
    params: DeletePreparedVideoParams,
    testApp: Express = app,
) {
    return request(testApp).delete('/api/ui/delete-prepared-video').query(params);
}
