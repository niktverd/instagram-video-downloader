import request from 'supertest';

import app from '../../app';
import {InstagramLocationSource, ScenarioType} from '../../src/types/enums';
import {DeleteScenarioParams, UpdateScenarioParams} from '../../src/types/scenario';

// Minimal valid payload for creating a scenario
const defaultCreatePayload = {
    slug: 'test-scenario',
    type: ScenarioType.ScenarioAddBannerAtTheEndUnique,
    enabled: true,
    onlyOnce: false,
    options: {},
    instagramLocationSource: InstagramLocationSource.Scenario,
};

export async function createScenarioHelper(payload = defaultCreatePayload, testApp = app) {
    return request(testApp).post('/api/ui/add-scenario').send(payload);
}

export async function getAllScenariosHelper(testApp = app, query = {}) {
    return request(testApp).get('/api/ui/get-scenarios').query(query);
}

export async function getScenarioByIdHelper(params = {}, testApp = app) {
    return request(testApp).get('/api/ui/get-scenario-by-id').query(params);
}

export async function updateScenarioHelper(payload: UpdateScenarioParams, testApp = app) {
    return request(testApp).patch('/api/ui/patch-scenario').send(payload);
}

export async function deleteScenarioHelper({id}: DeleteScenarioParams, testApp = app) {
    return request(testApp).delete('/api/ui/delete-scenario').query({id});
}
