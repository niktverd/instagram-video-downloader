/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {z} from 'zod';

import {PreparedVideo} from '../models/PreparedVideo';

import db from './utils';

export const CreatePreparedVideoParamsSchema = z
    .object({
        firebaseUrl: z.string(),
        scenarioId: z.number(),
        sourceId: z.number(),
        accountId: z.number(),
        duration: z.number().optional(),
    })
    .strict();

export type CreatePreparedVideoParams = z.infer<typeof CreatePreparedVideoParamsSchema>;
export type CreatePreparedVideoResponse = PartialModelObject<PreparedVideo>;

export async function createPreparedVideo(
    params: CreatePreparedVideoParams,
): Promise<CreatePreparedVideoResponse> {
    return await db.transaction(async (trx) => {
        const preparedVideo = await PreparedVideo.query(trx).insert(params);

        return preparedVideo;
    });
}

export const GetPreparedVideoByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetPreparedVideoByIdParams = z.infer<typeof GetPreparedVideoByIdParamsSchema>;
export type GetPreparedVideoByIdResponse = PartialModelObject<PreparedVideo>;

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

export const GetAllPreparedVideosParamsSchema = z.object({}).strict();
export type GetAllPreparedVideosParams = z.infer<typeof GetAllPreparedVideosParamsSchema>;
export type GetAllPreparedVideosResponse = PartialModelObject<PreparedVideo>[];

export async function getAllPreparedVideos(
    _params: GetAllPreparedVideosParams,
    trx?: Transaction,
): Promise<GetAllPreparedVideosResponse> {
    const preparedVideos = await PreparedVideo.query(trx || db);
    return preparedVideos;
}

export const UpdatePreparedVideoParamsSchema = CreatePreparedVideoParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export type UpdatePreparedVideoParams = z.infer<typeof UpdatePreparedVideoParamsSchema>;
export type UpdatePreparedVideoResponse = PartialModelObject<PreparedVideo>;
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

export const DeletePreparedVideoParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type DeletePreparedVideoParams = z.infer<typeof DeletePreparedVideoParamsSchema>;
export type DeletePreparedVideoResponse = number;

export async function deletePreparedVideo(
    params: DeletePreparedVideoParams,
    trx?: Transaction,
): Promise<DeletePreparedVideoResponse> {
    const deletedCount = await PreparedVideo.query(trx || db).deleteById(params.id);
    return deletedCount;
}

export const GetOnePreparedVideoParamsSchema = z
    .object({
        firebaseUrl: z.string().optional(),
        duration: z.number().optional(),
        scenarioId: z.number().optional(),
        sourceId: z.number().optional(),
        accountId: z.number().optional(),
    })
    .strict();

export type GetOnePreparedVideoParams = z.infer<typeof GetOnePreparedVideoParamsSchema>;
export type GetOnePreparedVideoResponse = PartialModelObject<PreparedVideo> | undefined;

export async function getOnePreparedVideo(
    params: GetOnePreparedVideoParams,
): Promise<GetOnePreparedVideoResponse> {
    const {firebaseUrl, accountId, scenarioId, sourceId} = params;
    const query = PreparedVideo.query(db);

    if (firebaseUrl) {
        query.where('firebaseUrl', firebaseUrl);
    }

    if (accountId && scenarioId && sourceId) {
        query
            .where('accountId', accountId)
            .andWhere('scenarioId', scenarioId)
            .andWhere('scenarioId', sourceId);
    }

    const preparedVideo = await query.first();

    return preparedVideo;
}
