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

import {IResponse} from '#src/types/common';
import {ThrownError} from '#src/utils/error';

export async function createInstagramLocation(
    params: CreateInstagramLocationParams,
): IResponse<CreateInstagramLocationResponse> {
    const locationPromise = await db.transaction(async (trx) => {
        const location = await InstagramLocation.query(trx).insert(params);

        return location;
    });

    return {
        result: locationPromise,
        code: 200,
    };
}

export async function getInstagramLocationById(
    params: GetInstagramLocationByIdParams,
    trx?: Transaction,
): Promise<GetInstagramLocationByIdResponse> {
    const location = await InstagramLocation.query(trx || db).findById(params.id);

    if (!location) {
        throw new ThrownError('InstagramLocation not found', 404);
    }

    return location;
}

export async function getAllInstagramLocations(
    params: GetAllInstagramLocationsParams,
    trx?: Transaction,
): IResponse<GetAllInstagramLocationsResponse> {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;
    const query = InstagramLocation.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    }

    if (params.groupTextFilter) {
        query.where('group', 'ilike', `%${params.groupTextFilter}%`);
    }

    if (params.commonTextFilter) {
        query.andWhere(function () {
            this.where('name', 'ilike', `%${params.commonTextFilter}%`).orWhere(
                'address',
                'ilike',
                `%${params.commonTextFilter}%`,
            );
        });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const result = await query.page(pageNumber - 1, limitNumber);

    return {
        result: {
            locations: result.results,
            count: result.total,
        },
        code: 200,
    };
}

export async function updateInstagramLocation(
    params: UpdateInstagramLocationParams,
    trx?: Transaction,
): IResponse<UpdateInstagramLocationResponse> {
    const {id, ...updateData} = params;

    const locationPromise = await (trx || db).transaction(async (t) => {
        const location = await InstagramLocation.query(t).patchAndFetchById(id, updateData);

        if (!location) {
            throw new ThrownError('InstagramLocation not found', 404);
        }

        return location;
    });

    return {
        result: locationPromise,
        code: 200,
    };
}

export async function deleteInstagramLocation(
    params: DeleteInstagramLocationParams,
    trx?: Transaction,
): IResponse<DeleteInstagramLocationResponse> {
    const deletedCount = await InstagramLocation.query(trx || db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
}
