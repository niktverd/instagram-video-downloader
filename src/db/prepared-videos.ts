/* eslint-disable @typescript-eslint/no-explicit-any */
import {OrderByDirection, Transaction} from 'objection';

import {PreparedVideo} from '../models/PreparedVideo';

import db from './utils';

import {
    CreatePreparedVideoParamsSchema,
    UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
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
): Promise<CreatePreparedVideoResponse> {
    return await db.transaction(async (trx) => {
        const validatedParams = CreatePreparedVideoParamsSchema.parse(params);
        const preparedVideo = await PreparedVideo.query(trx).insert(validatedParams);

        return preparedVideo;
    });
}

export async function getPreparedVideoById(
    params: GetPreparedVideoByIdParams,
    trx?: Transaction,
): Promise<GetPreparedVideoByIdResponse> {
    const preparedVideo = await PreparedVideo.query(trx || db).findById(params.id);

    if (!preparedVideo) {
        throw new Error('PreparedVideo not found');
    }

    return preparedVideo;
}

export async function getAllPreparedVideos(
    params: GetAllPreparedVideosParams,
    trx?: Transaction,
): Promise<GetAllPreparedVideosResponse> {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;

    const query = PreparedVideo.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as OrderByDirection);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Execute the query with pagination
    const result = await query.page(pageNumber - 1, limitNumber); // Objection uses 0-based page indexing

    return {
        preparedVideos: result.results,
        count: result.total,
    };
}

export async function updatePreparedVideo(
    params: UpdatePreparedVideoParams,
    trx?: Transaction,
): Promise<PreparedVideo> {
    const {id, ...updateData} = UpdatePreparedVideoParamsSchema.parse(params);

    return await (trx || db).transaction(async (t) => {
        const preparedVideo = await PreparedVideo.query(t).patchAndFetchById(id, updateData);

        if (!preparedVideo) {
            throw new Error('PreparedVideo not found');
        }

        return preparedVideo;
    });
}

export async function deletePreparedVideo(
    params: DeletePreparedVideoParams,
    trx?: Transaction,
): Promise<DeletePreparedVideoResponse> {
    const deletedCount = await PreparedVideo.query(trx || db).deleteById(params.id);
    return deletedCount;
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

    const preparedVideo = await query.first();

    return preparedVideo;
}
