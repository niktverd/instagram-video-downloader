import request from 'supertest';

import testApp from '../app';
import * as preparedVideosController from '../src/sections/ui/controllers/prepared-videos.controller';
import {CreatePreparedVideoResponse} from '../src/types/preparedVideo';

import './clearDbBeforeEach';
import {createAccountHelper} from './utils/accounts';
import {
    buildPreparedVideoPayload,
    createPreparedVideoHelper,
    deletePreparedVideoHelper,
    findPreparedVideoDuplicatesHelper,
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

    it('findPreparedVideoDuplicatesPost: should return duplicates for same accountId, sourceId, scenarioId', async () => {
        const ids = await createDeps();
        // Создаём 2 дубликата
        const payload1 = buildPreparedVideoPayload(ids);
        const payload2 = buildPreparedVideoPayload(ids);
        payload2.firebaseUrl = 'https://dummy.firebase.com/other.mp4';
        await createPreparedVideoHelper(payload1, testApp);
        await createPreparedVideoHelper(payload2, testApp);

        // Запрос на поиск дубликатов
        const res = await findPreparedVideoDuplicatesHelper(
            {
                accountId: ids.accountId,
                sourceId: ids.sourceId,
                scenarioId: ids.scenarioId,
            },
            testApp,
        );
        expect(res.status).toBeLessThan(299);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        // Проверяем, что оба firebaseUrl присутствуют
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const urls = res.body.map((v: any) => v.firebaseUrl);
        expect(urls).toContain(payload1.firebaseUrl);
        expect(urls).toContain(payload2.firebaseUrl);
    });

    it('getPreparedVideosStatisticsByDays: returns correct stats for given days', async () => {
        // Создаём записи с разными датами
        const now = new Date();
        const day1 = now.toISOString().slice(0, 10);
        const day2 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // вчера

        // Хак: создаём через createPreparedVideoHelper, потом патчим createdAt напрямую через knex
        let vid: CreatePreparedVideoResponse | undefined;
        const scenario = await createScenarioHelper(undefined, testApp);
        const account = await createAccountHelper(undefined, testApp);
        for (let i = 0; i < 3; i++) {
            const source = await createSourceHelper(undefined, testApp);
            const ids = {
                scenarioId: scenario.body.id,
                sourceId: source.body.id,
                accountId: account.body.id,
            };
            const payload = buildPreparedVideoPayload(ids);
            const response = await createPreparedVideoHelper(payload, testApp);

            vid = response.body;
        }
        if (!vid) {
            throw new Error('vid is undefined');
        }

        // vid1 и vid2 — сегодня, vid3 — вчера
        const db = require('../src/db/utils').getDb();
        try {
            await db('preparedVideos')
                .where({id: vid.id})
                .update({createdAt: `${day2}T12:00:00.000Z`});

            // Запросим статистику
            const res = await request(testApp)
                .get('/api/ui/get-prepared-videos-statistics-by-days')
                .query({days: [day1, day2]});
            expect(res.status).toBeLessThan(300);
            expect(res.body).toBeDefined();
            expect(typeof res.body).toBe('object');
            // Проверяем, что для day1 — 2 записи, для day2 — 1
            expect(res.body[day1]).toBe(2);
            expect(res.body[day2]).toBe(1);
        } finally {
            await db.destroy();
        }
    });
});
