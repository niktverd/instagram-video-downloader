/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import {InstagramLocation} from '../models/InstagramLocation';
import {
    CreateInstagramLocationParams,
    CreateInstagramLocationResponse,
    DeleteInstagramLocationParams,
    DeleteInstagramLocationResponse,
    GetAllInstagramLocationsParams,
    GetAllInstagramLocationsResponse,
    GetInstagramLocationByIdParams,
    GetInstagramLocationByIdResponse,
    UpdateInstagramLocationParams,
    UpdateInstagramLocationResponse,
} from '../types/instagramLocation';

import db from './utils';

export async function createInstagramLocation(
    params: CreateInstagramLocationParams,
): Promise<CreateInstagramLocationResponse> {
    return await db.transaction(async (trx) => {
        const location = await InstagramLocation.query(trx).insert(params);

        return location;
    });
}

export async function getInstagramLocationById(
    params: GetInstagramLocationByIdParams,
    trx?: Transaction,
): Promise<GetInstagramLocationByIdResponse> {
    const location = await InstagramLocation.query(trx || db).findById(params.id);

    if (!location) {
        throw new Error('InstagramLocation not found');
    }

    return location;
}

export async function getAllInstagramLocations(
    params: GetAllInstagramLocationsParams,
    trx?: Transaction,
): Promise<GetAllInstagramLocationsResponse> {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;
    const query = InstagramLocation.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const result = await query.page(pageNumber - 1, limitNumber);

    return {
        locations: result.results,
        count: result.total,
    };
}

export async function updateInstagramLocation(
    params: UpdateInstagramLocationParams,
    trx?: Transaction,
): Promise<UpdateInstagramLocationResponse> {
    const {id, ...updateData} = params;

    return await (trx || db).transaction(async (t) => {
        const location = await InstagramLocation.query(t).patchAndFetchById(id, updateData);

        if (!location) {
            throw new Error('InstagramLocation not found');
        }

        return location;
    });
}

export async function deleteInstagramLocation(
    params: DeleteInstagramLocationParams,
    trx?: Transaction,
): Promise<DeleteInstagramLocationResponse> {
    const deletedCount = await InstagramLocation.query(trx || db).deleteById(params.id);
    return deletedCount;
}
