import * as controller from '../src/sections/ui/controllers/cloud-run-scenario-executions.controller';
import {CloudRunScenarioExecutionStatusEnum} from '../src/types/enums';

import {
    createCloudRunScenarioExecutionHelper,
    getCloudRunScenarioExecutionHelper,
    updateCloudRunScenarioExecutionHelper,
} from './utils/cloudRunScenarioExecutions';

// import './clearDbBeforeEach';

describe('cloud-run-scenario-executions.controller', () => {
    it('should export all handlers', () => {
        expect(controller).toHaveProperty('createCloudRunScenarioExecutionPost');
        expect(controller).toHaveProperty('getAllCloudRunScenarioExecutionGet');
        expect(controller).toHaveProperty('updateCloudRunScenarioExecutionStatusPatch');
    });

    it('handlers should be functions', () => {
        expect(typeof controller.createCloudRunScenarioExecutionPost).toBe('function');
        expect(typeof controller.getAllCloudRunScenarioExecutionGet).toBe('function');
        expect(typeof controller.updateCloudRunScenarioExecutionStatusPatch).toBe('function');
    });

    const messageId = 'test-message-id';
    const attempt = 1;
    const basePayload = {
        messageId,
        accountId: 1,
        scenarioId: 1,
        sourceId: 1,
        status: CloudRunScenarioExecutionStatusEnum.InProgress,
        reqId: 'test-req-id',
        attempt,
        queueName: 'test-queue-name',
    };

    it('create & get', async () => {
        const resCreate = await createCloudRunScenarioExecutionHelper(basePayload);
        expect(resCreate.status).toBeLessThan(300);
        expect(resCreate.body).toBeDefined();
        expect(resCreate.body.messageId).toBe(messageId);
        expect(resCreate.body.attempt).toBe(attempt);

        const resGet = await getCloudRunScenarioExecutionHelper({});
        expect(resGet.status).toBeLessThan(300);
        expect(resGet.body).toBeDefined();
        expect(resGet.body.executions[0].messageId).toBe(messageId);
        expect(resGet.body.executions[0].attempt).toBe(attempt);
    });

    it('update', async () => {
        const resCreate = await createCloudRunScenarioExecutionHelper(basePayload);

        const update = {status: CloudRunScenarioExecutionStatusEnum.Success};
        const resPatch = await updateCloudRunScenarioExecutionHelper({
            id: resCreate.body.id,
            ...update,
        });
        expect(resPatch.status).toBeLessThan(300);
        expect(resPatch.body).toBeDefined();
        expect(resPatch.body.status).toBe(update.status);
    });
});
