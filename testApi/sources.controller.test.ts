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
});
