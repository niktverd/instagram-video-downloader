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
import {InstagramLocation} from '../types/models/InstagramLocation';

import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';

export const createInstagramLocation: ApiFunctionPrototype<
    CreateInstagramLocationParams,
    CreateInstagramLocationResponse
> = async (params, db) => {
    const locationPromise = await db.transaction(async (trx) => {
        const location = await InstagramLocation.query(trx).insert(params);

        return location;
    });

    return {
        result: locationPromise,
        code: 200,
    };
};

export const getInstagramLocationById: ApiFunctionPrototype<
    GetInstagramLocationByIdParams,
    GetInstagramLocationByIdResponse
> = async (params, db) => {
    const location = await InstagramLocation.query(db).findById(params.id);

    if (!location) {
        throw new ThrownError('InstagramLocation not found', 404);
    }

    return {
        result: location,
        code: 200,
    };
};

export const getAllInstagramLocations: ApiFunctionPrototype<
    GetAllInstagramLocationsParams,
    GetAllInstagramLocationsResponse
> = async (params, db) => {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;
    const query = InstagramLocation.query(db);

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
};

export const updateInstagramLocation: ApiFunctionPrototype<
    UpdateInstagramLocationParams,
    UpdateInstagramLocationResponse
> = async (params, db) => {
    const {id, ...updateData} = params;

    const locationPromise = await db.transaction(async (t) => {
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
};

export const deleteInstagramLocation: ApiFunctionPrototype<
    DeleteInstagramLocationParams,
    DeleteInstagramLocationResponse
> = async (params, db) => {
    const deletedCount = await InstagramLocation.query(db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
};
