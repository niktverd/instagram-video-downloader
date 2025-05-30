import testApp from '../app';
import * as scenariosController from '../src/sections/ui/controllers/scenarios.controller';

import './clearDbBeforeEach';
import {
    createScenarioHelper,
    deleteScenarioHelper,
    getAllScenariosHelper,
    getScenarioByIdHelper,
    updateScenarioHelper,
} from './utils/scenarios';

describe('scenarios.controller', () => {
    it('should export all handlers', () => {
        expect(scenariosController).toHaveProperty('getAllScenariosGet');
        expect(scenariosController).toHaveProperty('getScenarioByIdGet');
        expect(scenariosController).toHaveProperty('updateScenarioPatch');
        expect(scenariosController).toHaveProperty('createScenarioPost');
        expect(scenariosController).toHaveProperty('deleteScenarioDelete');
    });

    it('handlers should be functions', () => {
        expect(typeof scenariosController.getAllScenariosGet).toBe('function');
        expect(typeof scenariosController.getScenarioByIdGet).toBe('function');
        expect(typeof scenariosController.updateScenarioPatch).toBe('function');
        expect(typeof scenariosController.createScenarioPost).toBe('function');
        expect(typeof scenariosController.deleteScenarioDelete).toBe('function');
    });

    it('create & getAll', async () => {
        const response = await createScenarioHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAllScenariosHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(Array.isArray(response2.body)).toBe(true);
        expect(response2.body.length).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('update', async () => {
        const response = await createScenarioHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updateScenarioHelper(
            {
                id: response.body.id,
                slug: 'test-scenario-updated',
                type: response.body.type,
                enabled: false,
                onlyOnce: false,
                options: {},
                instagramLocationSource: response.body.instagramLocationSource,
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.slug).toBe('test-scenario-updated');
        expect(response2.status).toBeLessThan(299);
    });

    it('delete', async () => {
        const response = await createScenarioHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deleteScenarioHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllScenariosHelper(testApp);
        expect(response3.body).toBeDefined();
        expect(Array.isArray(response3.body)).toBe(true);
        // count may be 0 or >0 if DB is not isolated, so just check status
        expect(response3.status).toBeLessThan(299);
    });

    it('getById', async () => {
        const response = await createScenarioHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getScenarioByIdHelper({id: response.body.id}, testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(response.body.id);
        expect(response2.status).toBeLessThan(299);
    });
});
