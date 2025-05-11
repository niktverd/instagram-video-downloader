/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';
import {z} from 'zod';

import {InstagramMediaContainer} from '../models/InstagramMediaContainer';

import db from './utils';

import {IInstagramMediaContainer, InstagramMediaContainerSchema} from '#src/models/types';

export const CreateInstagramMediaContainerParamsSchema = InstagramMediaContainerSchema;
export type CreateInstagramMediaContainerParams = IInstagramMediaContainer;
export type CreateInstagramMediaContainerResponse = IInstagramMediaContainer;

export async function createInstagramMediaContainer(
    params: CreateInstagramMediaContainerParams,
): Promise<CreateInstagramMediaContainerResponse> {
    return await db.transaction(async (trx) => {
        const preparedVideo = await InstagramMediaContainer.query(trx).insert(params);

        return preparedVideo;
    });
}

export const GetInstagramMediaContainerByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetInstagramMediaContainerByIdParams = z.infer<
    typeof GetInstagramMediaContainerByIdParamsSchema
>;
export type GetInstagramMediaContainerByIdResponse = IInstagramMediaContainer;

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

export const GetAllInstagramMediaContainersParamsSchema = z.object({}).strict();
export type GetAllInstagramMediaContainersParams = z.infer<
    typeof GetAllInstagramMediaContainersParamsSchema
>;
export type GetAllInstagramMediaContainersResponse = IInstagramMediaContainer[];

export async function getAllInstagramMediaContainers(
    _params: GetAllInstagramMediaContainersParams,
    trx?: Transaction,
): Promise<GetAllInstagramMediaContainersResponse> {
    const preparedVideos = await InstagramMediaContainer.query(trx || db);
    return preparedVideos;
}

export const UpdateInstagramMediaContainerParamsSchema =
    CreateInstagramMediaContainerParamsSchema.partial()
        .extend({
            id: z.number(),
        })
        .strict();

export type UpdateInstagramMediaContainerParams = z.infer<
    typeof UpdateInstagramMediaContainerParamsSchema
>;
export type UpdateInstagramMediaContainerResponse = IInstagramMediaContainer;
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

export const DeleteInstagramMediaContainerParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type DeleteInstagramMediaContainerParams = z.infer<
    typeof DeleteInstagramMediaContainerParamsSchema
>;
export type DeleteInstagramMediaContainerResponse = number;

export async function deleteInstagramMediaContainer(
    params: DeleteInstagramMediaContainerParams,
    trx?: Transaction,
): Promise<DeleteInstagramMediaContainerResponse> {
    const deletedCount = await InstagramMediaContainer.query(trx || db).deleteById(params.id);
    return deletedCount;
}

export const GetLimitedInstagramMediaContainersParamsSchema = z
    .object({
        // firebaseUrl: z.string().optional(),
        // duration: z.number().optional(),
        // scenarioId: z.number().optional(),
        // sourceId: z.number().optional(),
        accountId: z.number().optional(),
        limit: z.number().optional(),
        notPublished: z.boolean().optional(),
        random: z.boolean().optional(),
    })
    .strict();

export type GetLimitedInstagramMediaContainersParams = z.infer<
    typeof GetLimitedInstagramMediaContainersParamsSchema
>;
export type GetLimitedInstagramMediaContainersResponse = IInstagramMediaContainer[];

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
