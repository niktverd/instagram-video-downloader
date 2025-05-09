/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {z} from 'zod';

import {Source} from '../models/Source';

import db from './utils';

export const CreateSourceParamsSchema = z
    .object({
        firebaseUrl: z.string().optional(),
        sources: z.record(z.any()),
        bodyJSONString: z.record(z.any()).optional(),
        duration: z.number().optional(),
        attempt: z.number().optional(),
        lastUsed: z.string().optional(),
        sender: z.string().optional(),
        recipient: z.string().optional(),
    })
    .strict();

export type CreateSourceParams = z.infer<typeof CreateSourceParamsSchema>;
export type CreateSourceResponse = PartialModelObject<Source>;

export async function createSource(
    params: CreateSourceParams,
    trx?: Transaction,
): Promise<CreateSourceResponse> {
    const typedParams: PartialModelObject<Source> = params;

    const source = await Source.query(trx || db).insert(typedParams);

    return source;
}

export const GetAllSourcesParamsSchema = z.object({}).strict();
export type GetAllSourcesParams = z.infer<typeof GetAllSourcesParamsSchema>;
export type GetAllSourcesResponse = PartialModelObject<Source>[];

export async function getAllSources(
    _params: GetAllSourcesParams,
    trx?: Transaction,
): Promise<GetAllSourcesResponse> {
    const sources = await Source.query(trx || db);

    return sources;
}

export const GetOneSourceParamsSchema = z
    .object({
        random: z.boolean().optional(),
        emptyFirebaseUrl: z.boolean().optional(),
    })
    .strict();
export type GetOneSourceParams = z.infer<typeof GetOneSourceParamsSchema>;
export type GetOneSourceResponse = PartialModelObject<Source> | undefined;

export async function getOneSource(
    params: GetOneSourceParams,
    trx?: Transaction,
): Promise<GetOneSourceResponse> {
    const {emptyFirebaseUrl, random} = params;
    const query = Source.query(trx || db);

    if (emptyFirebaseUrl) {
        query.whereNull('firebaseUrl').orWhere('firebaseUrl', '');
    }

    if (random) {
        query.orderByRaw('RANDOM()');
    }

    return query.limit(1).first();
}

export const UpdateSourceParamsSchema = CreateSourceParamsSchema.partial()
    .extend({
        id: z.number(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
    })
    .strict();

export type UpdateSourceParams = z.infer<typeof UpdateSourceParamsSchema>;
export type UpdateSourceResponse = PartialModelObject<Source>;
export async function updateSource(params: UpdateSourceParams, trx?: Transaction): Promise<Source> {
    const {id, ...updateData} = UpdateSourceParamsSchema.parse(params);

    const cleanUpdateData: any = {};

    Object.entries(updateData).forEach(([key, val]) => {
        if (['createdAt', 'updatedAt'].includes(key)) {
            return;
        }

        cleanUpdateData[key] = val;
    });

    const source = await Source.query(trx || db).patchAndFetchById(id, cleanUpdateData);
    return source;
}

export const DeleteSourceParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type DeleteSourceParams = z.infer<typeof DeleteSourceParamsSchema>;
export type DeleteSourceResponse = number;

export async function deleteSource(
    params: DeleteSourceParams,
    trx?: Transaction,
): Promise<DeleteSourceResponse> {
    const deletedCount = await Source.query(trx || db).deleteById(params.id);

    return deletedCount;
}

export const GetSourceByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetSourceByIdParams = z.infer<typeof GetSourceByIdParamsSchema>;
export type GetSourceByIdResponse = PartialModelObject<Source> | undefined;

export async function getSourceById(
    params: GetSourceByIdParams,
    trx?: Transaction,
): Promise<GetSourceByIdResponse> {
    const source = await Source.query(trx || db).findById(params.id);

    return source;
}
