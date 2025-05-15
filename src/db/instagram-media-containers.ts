/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import {InstagramMediaContainer} from '../models/InstagramMediaContainer';

import db from './utils';

import {
    CreateInstagramMediaContainerParamsSchema,
    UpdateInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerParamsSchema as _DeleteInstagramMediaContainerParamsSchema,
    GetAllInstagramMediaContainersParamsSchema as _GetAllInstagramMediaContainersParamsSchema,
    GetInstagramMediaContainerByIdParamsSchema as _GetInstagramMediaContainerByIdParamsSchema,
    GetLimitedInstagramMediaContainersParamsSchema as _GetLimitedInstagramMediaContainersParamsSchema,
} from '#schemas/handlers/instagramMediaContainer';
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
    IInstagramMediaContainer as _IInstagramMediaContainer,
    UpdateInstagramMediaContainerResponse as _UpdateInstagramMediaContainerResponse,
} from '#types';

export async function createInstagramMediaContainer(
    params: CreateInstagramMediaContainerParams,
): Promise<CreateInstagramMediaContainerResponse> {
    return await db.transaction(async (trx) => {
        const validatedParams = CreateInstagramMediaContainerParamsSchema.parse(params);
        const preparedVideo = await InstagramMediaContainer.query(trx).insert(validatedParams);

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
    _params: GetAllInstagramMediaContainersParams,
    trx?: Transaction,
): Promise<GetAllInstagramMediaContainersResponse> {
    const preparedVideos = await InstagramMediaContainer.query(trx || db);
    return preparedVideos;
}

export async function updateInstagramMediaContainer(
    params: UpdateInstagramMediaContainerParams,
    trx?: Transaction,
): Promise<InstagramMediaContainer> {
    const {id, ...updateData} = UpdateInstagramMediaContainerParamsSchema.parse(params);

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
    const {accountId, limit = 3, notPublished, random} = params;
    const query = InstagramMediaContainer.query(db);

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
