import {Express} from 'express';
import request from 'supertest';

import {CreateInstagramLocationParams} from '../../src/types/instagramLocation';

export const createLocationHelper = async (
    params: CreateInstagramLocationParams,
    testApp: Express,
) => {
    const paramsLocal: CreateInstagramLocationParams = params
        ? params
        : {
              externalId: 'test',
              externalIdSource: 'test',
              name: 'test',
              address: 'test',
              lat: 1,
              lng: 1,
              group: 'test',
          };

    return request(testApp).post('/api/ui/create-instagram-location').send(paramsLocal);
};

export const getAllLocationsHelper = (testApp: Express) => {
    return request(testApp).get('/api/ui/get-all-instagram-locations');
};
