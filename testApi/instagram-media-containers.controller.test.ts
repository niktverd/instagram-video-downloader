import request from 'supertest';

import testApp from '../app';

import {createAccountHelper} from './utils/accounts';
import {createInstagramMediaContainerHelper} from './utils/instagramMediaContainers';
import {createPreparedVideoHelper} from './utils/prepared-videos';
import {createScenarioHelper} from './utils/scenarios';
import {createSourceHelper} from './utils/sources';

describe('instagram-media-containers.controller', () => {
    it('getInstagramMediaContainersStatisticsByDays: returns correct stats for given days', async () => {
        // Создаём все зависимости
        const account = await createAccountHelper(undefined, testApp);
        const scenario = await createScenarioHelper(undefined, testApp);
        const source = await createSourceHelper(undefined, testApp);
        const preparedVideo = await createPreparedVideoHelper(
            {
                firebaseUrl: 'https://dummy.firebase.com/video.mp4',
                scenarioId: scenario.body.id,
                sourceId: source.body.id,
                accountId: account.body.id,
            },
            testApp,
        );
        const basePayload = {
            preparedVideoId: preparedVideo.body.id,
            accountId: account.body.id,
        };
        const now = new Date();
        const day1 = now.toISOString().slice(0, 10);
        const day2 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // вчера

        // Создаём 3 контейнера, один переносим на вчера
        await createInstagramMediaContainerHelper(basePayload, testApp);
        await createInstagramMediaContainerHelper(basePayload, testApp);
        await createInstagramMediaContainerHelper(basePayload, testApp);
        const db = require('../src/db/utils').getDb();

        try {
            // Логируем все контейнеры
            const containers = await db('instagramMediaContainers').select();

            let container;
            if (containers.length) {
                container = containers[containers.length - 1];
            } else {
                throw new Error('No containers found in DB');
            }

            await db('instagramMediaContainers')
                .where({id: container.id})
                .update({createdAt: `${day2}T12:00:00.000Z`});

            // Запросим статистику
            const res = await request(testApp)
                .get('/api/ui/get-instagram-media-containers-statistics-by-days')
                .query({days: [day1, day2]});
            expect(res.status).toBeLessThan(300);
            expect(res.body).toBeDefined();
            expect(typeof res.body).toBe('object');
            expect(res.body[day1]).toBe(2);
            expect(res.body[day2]).toBe(1);
        } finally {
            await db.destroy();
        }
    });
});
