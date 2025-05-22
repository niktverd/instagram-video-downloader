import {
    createInstagramLocation,
    deleteInstagramLocation,
    getAllInstagramLocations,
    updateInstagramLocation,
    wrapper,
} from '../../../db';

import {
    CreateInstagramLocationParamsSchema,
    DeleteInstagramLocationParamsSchema,
    GetAllInstagramLocationsParamsSchema,
    UpdateInstagramLocationParamsSchema,
} from '#schemas/handlers';
import {
    CreateInstagramLocationParams,
    CreateInstagramLocationResponse,
    DeleteInstagramLocationParams,
    DeleteInstagramLocationResponse,
    GetAllInstagramLocationsParams,
    GetAllInstagramLocationsResponse,
    UpdateInstagramLocationParams,
    UpdateInstagramLocationResponse,
} from '#types';

// Using 'any' type assertions to bypass type errors until we can fix the types completely
export const getAllInstagramLocationsGet = wrapper<
    GetAllInstagramLocationsParams,
    GetAllInstagramLocationsResponse
>(getAllInstagramLocations, GetAllInstagramLocationsParamsSchema, 'GET');

export const updateInstagramLocationPatch = wrapper<
    UpdateInstagramLocationParams,
    UpdateInstagramLocationResponse
>(updateInstagramLocation, UpdateInstagramLocationParamsSchema, 'PATCH');

export const createInstagramLocationPost = wrapper<
    CreateInstagramLocationParams,
    CreateInstagramLocationResponse
>(createInstagramLocation, CreateInstagramLocationParamsSchema, 'POST');

export const deleteInstagramLocationDelete = wrapper<
    DeleteInstagramLocationParams,
    DeleteInstagramLocationResponse
>(deleteInstagramLocation, DeleteInstagramLocationParamsSchema, 'DELETE');
