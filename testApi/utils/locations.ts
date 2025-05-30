import {Express} from 'express';
import request from 'supertest';

import {
    CreateInstagramLocationParams,
    DeleteInstagramLocationParams,
    UpdateInstagramLocationParams,
} from '../../src/types/instagramLocation';

export const createLocationHelper = async (
    params: CreateInstagramLocationParams | undefined,
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

export const updateLocationHelper = (
    params: Partial<UpdateInstagramLocationParams>,
    testApp: Express,
) => {
    return request(testApp).patch(`/api/ui/update-instagram-location`).send(params);
};

export const deleteLocationHelper = (params: DeleteInstagramLocationParams, testApp: Express) => {
    return request(testApp).delete(`/api/ui/delete-instagram-location`).query(params);
};
