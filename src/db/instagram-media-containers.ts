import {InstagramMediaContainer} from '../models/InstagramMediaContainer';

import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';
import {
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerResponse,
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerResponse,
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersResponse,
    GetInstagramMediaContainerByIdParams,
    GetInstagramMediaContainerByIdResponse,
    GetLimitedInstagramMediaContainersParams,
    GetLimitedInstagramMediaContainersResponse,
    InstagramMediaContainersStatisticsParams,
    InstagramMediaContainersStatisticsResponse,
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerResponse,
} from '#types';

export const createInstagramMediaContainer: ApiFunctionPrototype<
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerResponse
> = async (params, db) => {
    const preparedVideoPromise = await db.transaction(async (trx) => {
        const preparedVideo = await InstagramMediaContainer.query(trx).insert(params);

        return preparedVideo;
    });

    return {
        result: preparedVideoPromise,
        code: 200,
    };
};

export const getInstagramMediaContainerById: ApiFunctionPrototype<
    GetInstagramMediaContainerByIdParams,
    GetInstagramMediaContainerByIdResponse
> = async (params, db) => {
    const preparedVideo = await InstagramMediaContainer.query(db).findById(params.id);

    if (!preparedVideo) {
        throw new ThrownError('InstagramMediaContainer not found', 404);
    }

    return {
        result: preparedVideo,
        code: 200,
    };
};

export const getAllInstagramMediaContainers: ApiFunctionPrototype<
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersResponse
> = async (params, db) => {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;
    const query = InstagramMediaContainer.query(db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const result = await query.page(pageNumber - 1, limitNumber);

    return {
        result: {
            mediaContainers: result.results,
            count: result.total,
        },
        code: 200,
    };
};

export const updateInstagramMediaContainer: ApiFunctionPrototype<
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerResponse
> = async (params, db) => {
    const {id, ...updateData} = params;

    const preparedVideoPromise = await db.transaction(async (t) => {
        const preparedVideo = await InstagramMediaContainer.query(t).patchAndFetchById(
            id,
            updateData,
        );

        if (!preparedVideo) {
            throw new ThrownError('InstagramMediaContainer not found', 404);
        }

        return preparedVideo;
    });

    return {
        result: preparedVideoPromise,
        code: 200,
    };
};

export const deleteInstagramMediaContainer: ApiFunctionPrototype<
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerResponse
> = async (params, db) => {
    const deletedCount = await InstagramMediaContainer.query(db).deleteById(params.id);

    return {
        result: deletedCount,
        code: 200,
    };
};

export const getLimitedInstagramMediaContainers: ApiFunctionPrototype<
    GetLimitedInstagramMediaContainersParams,
    GetLimitedInstagramMediaContainersResponse
> = async (params, db) => {
    const {accountId, limit = 3, notPublished, random, isBlocked = false} = params;
    const query = InstagramMediaContainer.query(db).where('isBlocked', isBlocked);

    if (accountId) {
        query.where('accountId', accountId);
    }

    if (notPublished) {
        query.where('isPublished', false);
    }

    if (random) {
        query.orderByRaw('RANDOM()');
    }

    const preparedVideo = await query.limit(limit);

    return {
        result: preparedVideo,
        code: 200,
    };
};

export const getInstagramMediaContainersStatisticsByDays: ApiFunctionPrototype<
    InstagramMediaContainersStatisticsParams,
    InstagramMediaContainersStatisticsResponse
> = async (params, db) => {
    const {days} = params;
    if (!days.length) {
        return {result: {}, code: 200};
    }
    const rows = (await InstagramMediaContainer.query(db)
        .select(db.raw(`to_char("createdAt", 'YYYY-MM-DD') as day`), db.raw('count(*) as count'))
        .whereIn(db.raw(`to_char("createdAt", 'YYYY-MM-DD')`), days)
        .groupBy('day')) as unknown as Array<{day: string; count: string | number}>;
    const result: Record<string, number> = {};
    for (const row of rows) {
        result[row.day] = Number(row.count);
    }
    for (const day of days) {
        if (!(day in result)) result[day] = 0;
    }
    return {result, code: 200};
};
