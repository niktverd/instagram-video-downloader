/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import {InstagramMediaContainer} from '../models/InstagramMediaContainer';

import db from './utils';

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
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerResponse,
} from '#types';

export async function createInstagramMediaContainer(
    params: CreateInstagramMediaContainerParams,
): Promise<CreateInstagramMediaContainerResponse> {
    return await db.transaction(async (trx) => {
        const preparedVideo = await InstagramMediaContainer.query(trx).insert(params);

        return preparedVideo;
    });
}

export async function getInstagramMediaContainerById(
    params: GetInstagramMediaContainerByIdParams,
    trx?: Transaction,
): Promise<GetInstagramMediaContainerByIdResponse> {
    const preparedVideo = await InstagramMediaContainer.query(trx || db).findById(params.id);

    if (!preparedVideo) {
        throw new Error('InstagramMediaContainer not found');
    }

    return preparedVideo;
}

export async function getAllInstagramMediaContainers(
    params: GetAllInstagramMediaContainersParams,
    trx?: Transaction,
): Promise<GetAllInstagramMediaContainersResponse> {
    const {page = 1, limit = 10, sortBy, sortOrder = 'desc'} = params;
    const query = InstagramMediaContainer.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const result = await query.page(pageNumber - 1, limitNumber);

    return {
        mediaContainers: result.results,
        count: result.total,
    };
}

export async function updateInstagramMediaContainer(
    params: UpdateInstagramMediaContainerParams,
    trx?: Transaction,
): Promise<UpdateInstagramMediaContainerResponse> {
    const {id, ...updateData} = params;

    return await (trx || db).transaction(async (t) => {
        const preparedVideo = await InstagramMediaContainer.query(t).patchAndFetchById(
            id,
            updateData,
        );

        if (!preparedVideo) {
            throw new Error('InstagramMediaContainer not found');
        }

        return preparedVideo;
    });
}

export async function deleteInstagramMediaContainer(
    params: DeleteInstagramMediaContainerParams,
    trx?: Transaction,
): Promise<DeleteInstagramMediaContainerResponse> {
    const deletedCount = await InstagramMediaContainer.query(trx || db).deleteById(params.id);
    return deletedCount;
}

export async function getLimitedInstagramMediaContainers(
    params: GetLimitedInstagramMediaContainersParams,
): Promise<GetLimitedInstagramMediaContainersResponse> {
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

    return preparedVideo;
}
