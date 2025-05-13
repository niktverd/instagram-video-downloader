/* eslint-disable @typescript-eslint/no-explicit-any */
import {OrderByDirection, Transaction} from 'objection';
import {z} from 'zod';

import {Source} from '../models/Source';

import db from './utils';

import {ISource, SourceSchema} from '#src/models/types';

export const CreateSourceParamsSchema = SourceSchema.omit({id: true});
export type CreateSourceParams = Omit<ISource, 'id'>;
export type CreateSourceResponse = ISource;

export async function createSource(
    params: CreateSourceParams,
    trx?: Transaction,
): Promise<CreateSourceResponse> {
    const source = await Source.query(trx || db).insert(params);

    return source;
}

export const GetAllSourcesParamsSchema = z
    .object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
    })
    .strict();
export type GetAllSourcesParams = z.infer<typeof GetAllSourcesParamsSchema>;
export type GetAllSourcesResponse = {sources: ISource[]; count: number};

export async function getAllSources(
    params: GetAllSourcesParams,
    trx?: Transaction,
): Promise<GetAllSourcesResponse> {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
    } = GetAllSourcesParamsSchema.parse(params);
    const query = Source.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as OrderByDirection);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Execute the query with pagination
    const result = await query.page(pageNumber - 1, limitNumber); // Objection uses 0-based page indexing

    // Result contains 'results' (array of data) and 'total' (total count)
    return {
        sources: result.results,
        count: result.total,
    };
}

export const GetOneSourceParamsSchema = z
    .object({
        id: z.number().optional(),
        random: z.boolean().optional(),
        emptyFirebaseUrl: z.boolean().optional(),
    })
    .strict();
export type GetOneSourceParams = z.infer<typeof GetOneSourceParamsSchema>;
export type GetOneSourceResponse = ISource | undefined;

export async function getOneSource(
    params: GetOneSourceParams,
    trx?: Transaction,
): Promise<GetOneSourceResponse> {
    const {emptyFirebaseUrl, random, id} = params;
    const query = Source.query(trx || db);

    if (id) {
        query.where('id', id);
    }

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
export type UpdateSourceResponse = ISource;
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
export type GetSourceByIdResponse = ISource | undefined;

export async function getSourceById(
    params: GetSourceByIdParams,
    trx?: Transaction,
): Promise<GetSourceByIdResponse> {
    const source = await Source.query(trx || db).findById(params.id);

    return source;
}
