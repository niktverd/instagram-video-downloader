import testApp from '../app';
import * as controller from '../src/sections/ui/controllers/instagram-locations.controller';

import './clearDbBeforeEach';
import {createLocationHelper, getAllLocationsHelper} from './utils/locations';

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
});
