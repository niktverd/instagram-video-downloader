import {OrderByDirection} from 'objection';

import {PreparedVideo} from '../models/PreparedVideo';

import {
    CreatePreparedVideoParamsSchema,
    UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';
import {
    CreatePreparedVideoParams,
    CreatePreparedVideoResponse,
    DeletePreparedVideoParams,
    DeletePreparedVideoResponse,
    FindPreparedVideoDuplicatesParams,
    FindPreparedVideoDuplicatesResponse,
    GetAllPreparedVideosParams,
    GetAllPreparedVideosResponse,
    GetOnePreparedVideoParams,
    GetOnePreparedVideoResponse,
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdResponse,
    IPreparedVideo,
    PreparedVideosStatisticsParams,
    PreparedVideosStatisticsResponse,
    UpdatePreparedVideoParams,
    UpdatePreparedVideoResponse,
} from '#types';

export const createPreparedVideo: ApiFunctionPrototype<
    CreatePreparedVideoParams,
    CreatePreparedVideoResponse
> = async (params, db) => {
    const preparedVideoPromise = await db.transaction(async (trx) => {
        const validatedParams = CreatePreparedVideoParamsSchema.parse(params);
        const preparedVideo = await PreparedVideo.query(trx).insert(validatedParams);

        return preparedVideo;
    });

    return {
        result: preparedVideoPromise,
        code: 200,
    };
};

export const getPreparedVideoById: ApiFunctionPrototype<
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdResponse
> = async (params, db) => {
    const preparedVideo = await PreparedVideo.query(db).findById(params.id);

    if (!preparedVideo) {
        throw new ThrownError('PreparedVideo not found', 404);
    }

    return {
        result: preparedVideo,
        code: 200,
    };
};

export const getAllPreparedVideos: ApiFunctionPrototype<
    GetAllPreparedVideosParams,
    GetAllPreparedVideosResponse
> = async (params, db) => {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
        scenarioIds,
        sourceIds,
        accountIds,
        findDuplicates,
    } = params;

    if (findDuplicates) {
        // Группируем по accountId, sourceId, scenarioId и ищем группы с count > 1
        const subquery = PreparedVideo.query(db)
            .select('accountId', 'sourceId', 'scenarioId')
            .count('* as count')
            .groupBy('accountId', 'sourceId', 'scenarioId')
            .havingRaw('count(*) > 1');

        // page/limit для групп
        const groups = await subquery.page(Number(page) - 1, Number(limit));
        const groupRows = groups.results;
        const groupCount = groups.total;

        // Для каждой группы — получить все видео из этой группы
        let preparedVideos: IPreparedVideo[] = [];
        if (groupRows.length > 0) {
            const orConditions = groupRows.map((g) => {
                return {
                    accountId: g.accountId,
                    sourceId: g.sourceId,
                    scenarioId: g.scenarioId,
                };
            });
            preparedVideos = await PreparedVideo.query(db).where((builder) => {
                orConditions.forEach((cond) => {
                    builder.orWhere(cond);
                });
            });
        }
        return {
            result: {
                preparedVideos,
                count: groupCount,
            },
            code: 200,
        };
    }

    const query = PreparedVideo.query(db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as OrderByDirection);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (scenarioIds) {
        query.whereIn('scenarioId', scenarioIds);
    }

    if (sourceIds) {
        query.whereIn('sourceId', sourceIds);
    }

    if (accountIds) {
        query.whereIn('accountId', accountIds);
    }

    // Execute the query with pagination
    const result = await query.page(pageNumber - 1, limitNumber); // Objection uses 0-based page indexing

    return {
        result: {
            preparedVideos: result.results,
            count: result.total,
        },
        code: 200,
    };
};

export const updatePreparedVideo: ApiFunctionPrototype<
    UpdatePreparedVideoParams,
    UpdatePreparedVideoResponse
> = async (params, db) => {
    const {id, ...updateData} = UpdatePreparedVideoParamsSchema.parse(params);

    const preparedVideoPromise = await db.transaction(async (t) => {
        const preparedVideo = await PreparedVideo.query(t).patchAndFetchById(id, updateData);

        if (!preparedVideo) {
            throw new ThrownError('PreparedVideo not found', 404);
        }

        return preparedVideo;
    });

    return {
        result: preparedVideoPromise,
        code: 200,
    };
};

export const deletePreparedVideo: ApiFunctionPrototype<
    DeletePreparedVideoParams,
    DeletePreparedVideoResponse
> = async (params, db) => {
    const deletedCount = await PreparedVideo.query(db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
};

export const getOnePreparedVideo: ApiFunctionPrototype<
    GetOnePreparedVideoParams,
    GetOnePreparedVideoResponse
> = async (params, db) => {
    const {
        hasFirebaseUrl,
        firebaseUrl,
        accountId,
        scenarioId,
        sourceId,
        random,
        notInInstagramMediaContainers,
        fetchGraphAccount,
        fetchGraphScenario,
        fetchGraphSource,
    } = params;
    const query = PreparedVideo.query(db);

    if (hasFirebaseUrl) {
        query.whereNotNull('firebaseUrl');
    }

    if (firebaseUrl) {
        query.where('firebaseUrl', firebaseUrl);
    }

    if (accountId && scenarioId && sourceId) {
        query
            .where('accountId', accountId)
            .andWhere('scenarioId', scenarioId)
            .andWhere('scenarioId', sourceId);
    } else if (accountId) {
        query.where('accountId', accountId);
    }

    if (random) {
        query.orderByRaw('RANDOM()');
    }

    if (notInInstagramMediaContainers) {
        query.whereNotIn('id', db('instagramMediaContainers').select('preparedVideoId'));
    }

    if (fetchGraphAccount) {
        query.withGraphFetched('account');
    }

    if (fetchGraphScenario) {
        query.withGraphFetched('scenario');
    }

    if (fetchGraphSource) {
        query.withGraphFetched('source');
    }

    const preparedVideo = await query.first().withGraphFetched('scenario');

    return {
        result: preparedVideo,
        code: 200,
    };
};

export const findPreparedVideoDuplicates: ApiFunctionPrototype<
    FindPreparedVideoDuplicatesParams,
    FindPreparedVideoDuplicatesResponse
> = async (params, db) => {
    const {accountId, sourceId, scenarioId} = params;
    // Найти все видео с такими же accountId, sourceId, scenarioId
    const videos = await PreparedVideo.query(db).where({accountId, sourceId, scenarioId});

    // Если найдено больше одной — это дубликаты
    if (videos.length > 1) {
        return {result: videos, code: 200};
    }

    return {result: [], code: 200};
};

export const getPreparedVideosStatisticsByDays: ApiFunctionPrototype<
    PreparedVideosStatisticsParams,
    PreparedVideosStatisticsResponse
> = async (params, db) => {
    const {days} = params;
    if (!days.length) return {result: {}, code: 200};
    const rows = (await PreparedVideo.query(db)
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
