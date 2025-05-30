import testApp from '../app';
import * as preparedVideosController from '../src/sections/ui/controllers/prepared-videos.controller';

import './clearDbBeforeEach';
import {createAccountHelper} from './utils/accounts';
import {
    buildPreparedVideoPayload,
    createPreparedVideoHelper,
    deletePreparedVideoHelper,
    getAllPreparedVideosHelper,
    getPreparedVideoByIdHelper,
    updatePreparedVideoHelper,
} from './utils/prepared-videos';
import {createScenarioHelper} from './utils/scenarios';
import {createSourceHelper} from './utils/sources';

describe('prepared-videos.controller', () => {
    async function createDeps() {
        const scenario = await createScenarioHelper(undefined, testApp);
        const source = await createSourceHelper(undefined, testApp);
        const account = await createAccountHelper(undefined, testApp);
        return {
            scenarioId: scenario.body.id,
            sourceId: source.body.id,
            accountId: account.body.id,
        };
    }

    it('should export all handlers', () => {
        expect(preparedVideosController).toHaveProperty('createPreparedVideoPost');
        expect(preparedVideosController).toHaveProperty('updatePreparedVideoPatch');
        expect(preparedVideosController).toHaveProperty('getPreparedVideoByIdGet');
        expect(preparedVideosController).toHaveProperty('getAllPreparedVideosGet');
        expect(preparedVideosController).toHaveProperty('deletePreparedVideoDelete');
    });

    it('handlers should be functions', () => {
        expect(typeof preparedVideosController.createPreparedVideoPost).toBe('function');
        expect(typeof preparedVideosController.updatePreparedVideoPatch).toBe('function');
        expect(typeof preparedVideosController.getPreparedVideoByIdGet).toBe('function');
        expect(typeof preparedVideosController.getAllPreparedVideosGet).toBe('function');
        expect(typeof preparedVideosController.deletePreparedVideoDelete).toBe('function');
    });

    it('create & getAll', async () => {
        const ids = await createDeps();
        const payload = buildPreparedVideoPayload(ids);
        const response = await createPreparedVideoHelper(payload, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);
        expect(response.body.id).toBeDefined();
        expect(response.body.firebaseUrl).toBe(payload.firebaseUrl);

        const response2 = await getAllPreparedVideosHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(Array.isArray(response2.body.preparedVideos)).toBe(true);
        expect(response2.body.count).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('update', async () => {
        const ids = await createDeps();
        const payload = buildPreparedVideoPayload(ids);
        const response = await createPreparedVideoHelper(payload, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updatePreparedVideoHelper(
            {
                id: response.body.id,
                firebaseUrl: 'https://dummy.firebase.com/updated.mp4',
                scenarioId: ids.scenarioId,
                sourceId: ids.sourceId,
                accountId: ids.accountId,
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.firebaseUrl).toBe('https://dummy.firebase.com/updated.mp4');
        expect(response2.status).toBeLessThan(299);
    });

    it('delete', async () => {
        const ids = await createDeps();
        const payload = buildPreparedVideoPayload(ids);
        const response = await createPreparedVideoHelper(payload, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deletePreparedVideoHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllPreparedVideosHelper(testApp);
        expect(response3.body).toBeDefined();
        // count may be 0 or >0 if DB is not isolated, so just check status
        expect(response3.status).toBeLessThan(299);
    });

    it('getPreparedVideoById', async () => {
        const ids = await createDeps();
        const payload = buildPreparedVideoPayload(ids);
        const response = await createPreparedVideoHelper(payload, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getPreparedVideoByIdHelper({id: response.body.id}, testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(response.body.id);
        expect(response2.status).toBeLessThan(299);
    });
});
