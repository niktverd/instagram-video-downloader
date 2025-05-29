/* eslint-disable @typescript-eslint/no-explicit-any */
import {OrderByDirection, Transaction} from 'objection';

import {PreparedVideo} from '../models/PreparedVideo';

import db from './utils';

import {
    CreatePreparedVideoParamsSchema,
    UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
import {IResponse} from '#src/types/common';
import {ThrownError} from '#src/utils/error';
import {
    CreatePreparedVideoParams,
    CreatePreparedVideoResponse,
    DeletePreparedVideoParams,
    DeletePreparedVideoResponse,
    GetAllPreparedVideosParams,
    GetAllPreparedVideosResponse,
    GetOnePreparedVideoParams,
    GetOnePreparedVideoResponse,
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdResponse,
    UpdatePreparedVideoParams,
    IPreparedVideo as _IPreparedVideo,
    UpdatePreparedVideoResponse as _UpdatePreparedVideoResponse,
} from '#types';

export async function createPreparedVideo(
    params: CreatePreparedVideoParams,
): IResponse<CreatePreparedVideoResponse> {
    const preparedVideoPromise = await db.transaction(async (trx) => {
        const validatedParams = CreatePreparedVideoParamsSchema.parse(params);
        const preparedVideo = await PreparedVideo.query(trx).insert(validatedParams);

        return preparedVideo;
    });

    return {
        result: preparedVideoPromise,
        code: 200,
    };
}

export async function getPreparedVideoById(
    params: GetPreparedVideoByIdParams,
    trx?: Transaction,
): IResponse<GetPreparedVideoByIdResponse> {
    const preparedVideo = await PreparedVideo.query(trx || db).findById(params.id);

    if (!preparedVideo) {
        throw new ThrownError('PreparedVideo not found', 404);
    }

    return {
        result: preparedVideo,
        code: 200,
    };
}

export async function getAllPreparedVideos(
    params: GetAllPreparedVideosParams,
    trx?: Transaction,
): IResponse<GetAllPreparedVideosResponse> {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
        scenarioIds,
        sourceIds,
        accountIds,
    } = params;

    const query = PreparedVideo.query(trx || db);

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
}

export async function updatePreparedVideo(
    params: UpdatePreparedVideoParams,
    trx?: Transaction,
): IResponse<PreparedVideo> {
    const {id, ...updateData} = UpdatePreparedVideoParamsSchema.parse(params);

    const preparedVideoPromise = await (trx || db).transaction(async (t) => {
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
}

export async function deletePreparedVideo(
    params: DeletePreparedVideoParams,
    trx?: Transaction,
): IResponse<DeletePreparedVideoResponse> {
    const deletedCount = await PreparedVideo.query(trx || db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
}

export async function getOnePreparedVideo(
    params: GetOnePreparedVideoParams,
): Promise<GetOnePreparedVideoResponse> {
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

    return preparedVideo;
}
