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
import {IResponse} from '#src/types/common';
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
    UpdateSourceResponse,
    UpdateSourceResponse as _UpdateSourceResponse,
} from '#types';

export async function createSource(
    params: CreateSourceParams,
    trx?: Transaction,
): IResponse<CreateSourceResponse> {
    const validatedParams = CreateSourceParamsSchema.parse(params);
    const source = await Source.query(trx || db).insert(validatedParams);

    return {
        result: source,
        code: 200,
    };
}

export async function getAllSources(
    params: GetAllSourcesParams,
    trx?: Transaction,
): IResponse<GetAllSourcesResponse> {
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
        result: {
            sources: result.results,
            count: result.total,
        },
        code: 200,
    };
}

export async function getOneSource(
    params: GetOneSourceParams,
    trx?: Transaction,
): IResponse<GetOneSourceResponse> {
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

    const source = await query.limit(1).first();

    return {
        result: source,
        code: 200,
    };
}

export async function updateSource(
    params: UpdateSourceParams,
    trx?: Transaction,
): IResponse<UpdateSourceResponse> {
    const {id, ...updateData} = UpdateSourceParamsSchema.parse(params);

    const cleanUpdateData: any = {};

    Object.entries(updateData).forEach(([key, val]) => {
        if (['createdAt', 'updatedAt'].includes(key)) {
            return;
        }

        cleanUpdateData[key] = val;
    });

    const source = await Source.query(trx || db).patchAndFetchById(id, cleanUpdateData);

    return {
        result: source,
        code: 200,
    };
}

export async function deleteSource(
    params: DeleteSourceParams,
    trx?: Transaction,
): IResponse<DeleteSourceResponse> {
    const deletedCount = await Source.query(trx || db).deleteById(params.id);

    return {
        result: deletedCount,
        code: 200,
    };
}

export async function getSourceById(
    params: GetSourceByIdParams,
    trx?: Transaction,
): IResponse<GetSourceByIdResponse> {
    const source = await Source.query(trx || db).findById(params.id);

    return {
        result: source,
        code: 200,
    };
}
