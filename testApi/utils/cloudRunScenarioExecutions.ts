import request from 'supertest';

import testApp from '../../app';
import {
    CloudRunScenarioExecutionParams,
    GetAllCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionParams,
} from '../../src/types/cloudRunScenarioExecution';

export function createCloudRunScenarioExecutionHelper(payload: CloudRunScenarioExecutionParams) {
    return request(testApp).post('/api/ui/create-cloud-run-scenario-execution').send(payload);
}

export function getCloudRunScenarioExecutionHelper(payload: GetAllCloudRunScenarioExecutionParams) {
    return request(testApp).get('/api/ui/get-cloud-run-scenario-execution').query(payload);
}

export function updateCloudRunScenarioExecutionHelper(
    payload: UpdateCloudRunScenarioExecutionParams,
) {
    return request(testApp).patch('/api/ui/update-cloud-run-scenario-execution').send(payload);
}
