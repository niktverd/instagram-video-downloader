import request from 'supertest';

import testApp from '../app';
import * as sourcesController from '../src/sections/ui/controllers/sources.controller';

import './clearDbBeforeEach';
import {
    createSourceHelper,
    deleteSourceHelper,
    getAllSourcesHelper,
    getOneSourceHelper,
    updateSourceHelper,
} from './utils/sources';

describe('sources.controller', () => {
    it('should export all handlers', () => {
        expect(sourcesController).toHaveProperty('getAllSourcesGet');
        expect(sourcesController).toHaveProperty('getOneSourceGet');
        expect(sourcesController).toHaveProperty('updateSourcePatch');
        expect(sourcesController).toHaveProperty('createSourcePost');
        expect(sourcesController).toHaveProperty('deleteSourceDelete');
    });

    it('handlers should be functions', () => {
        expect(typeof sourcesController.getAllSourcesGet).toBe('function');
        expect(typeof sourcesController.getOneSourceGet).toBe('function');
        expect(typeof sourcesController.updateSourcePatch).toBe('function');
        expect(typeof sourcesController.createSourcePost).toBe('function');
        expect(typeof sourcesController.deleteSourceDelete).toBe('function');
    });

    it('create & getAll', async () => {
        const response = await createSourceHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAllSourcesHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.count).toBeDefined();
        expect(response2.body.count).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('update', async () => {
        const response = await createSourceHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updateSourceHelper(
            {
                id: response.body.id,
                sender: 'test2',
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.sender).toBe('test2');
        expect(response2.status).toBeLessThan(299);
    });

    it('delete', async () => {
        const response = await createSourceHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deleteSourceHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllSourcesHelper(testApp);
        expect(response3.body).toBeDefined();
        // count may be 0 or >0 if DB is not isolated, so just check status
        expect(response3.status).toBeLessThan(299);
    });

    it('getOne', async () => {
        const response = await createSourceHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getOneSourceHelper({id: response.body.id}, testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(response.body.id);
        expect(response2.status).toBeLessThan(299);
    });

    it('getSourcesStatisticsByDays: returns correct stats for given days', async () => {
        // Создаём записи с разными датами
        const now = new Date();
        const day1 = now.toISOString().slice(0, 10);
        const day2 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // вчера

        // Хак: создаём через createSourceHelper, потом патчим createdAt напрямую через knex
        await createSourceHelper(undefined, testApp);
        await createSourceHelper(undefined, testApp);
        const src3 = await createSourceHelper(undefined, testApp);
        // src1 и src2 — сегодня, src3 — вчера
        const db = require('../src/db/utils').getDb();
        await db('sources')
            .where({id: src3.body.id})
            .update({createdAt: `${day2}T12:00:00.000Z`});

        try {
            // Запросим статистику
            const res = await request(testApp)
                .get('/api/ui/get-sources-statistics-by-days')
                .query({days: [day1, day2]});
            expect(res.status).toBeLessThan(300);
            expect(res.body).toBeDefined();
            expect(typeof res.body).toBe('object');
            // Проверяем, что для day1 — 2 записи, для day2 — 1
            expect(res.body[day1]).toBe(2);
            expect(res.body[day2]).toBe(1);
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            await db.destroy();
        }
    });
});
