import testApp from '../app';
import * as controller from '../src/sections/ui/controllers/instagram-locations.controller';

// import './clearDbBeforeEach';
import {
    createLocationHelper,
    deleteLocationHelper,
    getAllLocationsHelper,
    updateLocationHelper,
} from './utils/locations';

describe('instagram-locations.controller', () => {
    it('should export all handlers', () => {
        expect(controller).toHaveProperty('getAllInstagramLocationsGet');
        expect(controller).toHaveProperty('updateInstagramLocationPatch');
        expect(controller).toHaveProperty('createInstagramLocationPost');
        expect(controller).toHaveProperty('deleteInstagramLocationDelete');
    });

    it('handlers should be functions', () => {
        expect(typeof controller.getAllInstagramLocationsGet).toBe('function');
        expect(typeof controller.updateInstagramLocationPatch).toBe('function');
        expect(typeof controller.createInstagramLocationPost).toBe('function');
        expect(typeof controller.deleteInstagramLocationDelete).toBe('function');
    });

    it('createInstagramLocationPost & getAllInstagramLocationsGet', async () => {
        const response = await createLocationHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await getAllLocationsHelper(testApp);
        expect(response2.body).toBeDefined();
        expect(response2.body.count).toBeDefined();
        expect(response2.body.count).not.toBe(0);
        expect(response2.status).toBeLessThan(299);
    });

    it('updateInstagramLocationPatch', async () => {
        const response = await createLocationHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await updateLocationHelper(
            {
                id: response.body.id,
                name: 'test2',
            },
            testApp,
        );
        expect(response2.body).toBeDefined();
        expect(response2.body.name).toBe('test2');
        expect(response2.status).toBeLessThan(299);
    });

    it('deleteInstagramLocationDelete', async () => {
        const response = await createLocationHelper(undefined, testApp);
        expect(response.body).toBeDefined();
        expect(response.status).toBeLessThan(299);

        const response2 = await deleteLocationHelper({id: response.body.id}, testApp);
        expect(response2.status).toBeLessThan(299);

        const response3 = await getAllLocationsHelper(testApp);
        expect(response3.body).toBeDefined();
        expect(response3.body.count).toBeDefined();
        expect(response3.body.count).toBe(0);
        expect(response3.status).toBeLessThan(299);
    });
});
