import {Express} from 'express';
import request from 'supertest';

import app from '../../app';
import {CreateInstagramMediaContainerParams} from '../../src/types/instagramMediaContainer';

// Minimal valid payload for creating an instagram media container
// (должен содержать accountId, scenarioId, sourceId, firebaseUrl и т.д. по модели)

export async function createInstagramMediaContainerHelper(
    payload: CreateInstagramMediaContainerParams,
    testApp: Express = app,
) {
    return request(testApp).post('/api/ui/create-instagram-media-container').send(payload);
}
