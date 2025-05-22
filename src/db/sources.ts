/* eslint-disable @typescript-eslint/no-explicit-any */
import {OrderByDirection, Transaction} from 'objection';

import {Source} from '../models/Source';

import db from './utils';

import {
    CreateSourceParamsSchema,
    GetAllSourcesParamsSchema,
    UpdateSourceParamsSchema,
    DeleteSourceParamsSchema as _DeleteSourceParamsSchema,
    GetOneSourceParamsSchema as _GetOneSourceParamsSchema,
    GetSourceByIdParamsSchema as _GetSourceByIdParamsSchema,
} from '#schemas/handlers/source';
import {
    CreateSourceParams,
    CreateSourceResponse,
    DeleteSourceParams,
    DeleteSourceResponse,
    GetAllSourcesParams,
    GetAllSourcesResponse,
    GetOneSourceParams,
    GetOneSourceResponse,
    GetSourceByIdParams,
    GetSourceByIdResponse,
    UpdateSourceParams,
    UpdateSourceResponse as _UpdateSourceResponse,
} from '#types';

export async function createSource(
    params: CreateSourceParams,
    trx?: Transaction,
): Promise<CreateSourceResponse> {
    const validatedParams = CreateSourceParamsSchema.parse(params);
    const source = await Source.query(trx || db).insert(validatedParams);

    return source;
}

export async function getAllSources(
    params: GetAllSourcesParams,
    trx?: Transaction,
): Promise<GetAllSourcesResponse> {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
        notInThePreparedVideos = false,
    } = GetAllSourcesParamsSchema.parse(params);
    const query = Source.query(trx || db);

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as OrderByDirection);
    }

    if (notInThePreparedVideos) {
        query.whereNotIn('id', function () {
            this.select('sourceId').from('preparedVideos');
        });
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

export async function deleteSource(
    params: DeleteSourceParams,
    trx?: Transaction,
): Promise<DeleteSourceResponse> {
    const deletedCount = await Source.query(trx || db).deleteById(params.id);

    return deletedCount;
}

export async function getSourceById(
    params: GetSourceByIdParams,
    trx?: Transaction,
): Promise<GetSourceByIdResponse> {
    const source = await Source.query(trx || db).findById(params.id);

    return source;
}
