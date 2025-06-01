/* eslint-disable @typescript-eslint/no-explicit-any */
import {OrderByDirection} from 'objection';

import {Source} from '../models/Source';

import {
    CreateSourceParamsSchema,
    GetAllSourcesParamsSchema,
    UpdateSourceParamsSchema,
    DeleteSourceParamsSchema as _DeleteSourceParamsSchema,
    GetOneSourceParamsSchema as _GetOneSourceParamsSchema,
    GetSourceByIdParamsSchema as _GetSourceByIdParamsSchema,
} from '#schemas/handlers/source';
import {ApiFunctionPrototype} from '#src/types/common';
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
    SourceStatisticsParams,
    SourceStatisticsResponse,
    UpdateSourceParams,
    UpdateSourceResponse,
    UpdateSourceResponse as _UpdateSourceResponse,
} from '#types';

export const createSource: ApiFunctionPrototype<CreateSourceParams, CreateSourceResponse> = async (
    params,
    db,
) => {
    const validatedParams = CreateSourceParamsSchema.parse(params);
    const source = await Source.query(db).insert(validatedParams);

    return {
        result: source,
        code: 200,
    };
};

export const getAllSources: ApiFunctionPrototype<
    GetAllSourcesParams,
    GetAllSourcesResponse
> = async (params, db) => {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
        notInThePreparedVideos = false,
    } = GetAllSourcesParamsSchema.parse(params);
    const query = Source.query(db);

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
};

export const getOneSource: ApiFunctionPrototype<GetOneSourceParams, GetOneSourceResponse> = async (
    params,
    db,
) => {
    const {emptyFirebaseUrl, random, id} = params;
    const query = Source.query(db);

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
};

export const updateSource: ApiFunctionPrototype<UpdateSourceParams, UpdateSourceResponse> = async (
    params,
    db,
) => {
    const {id, ...updateData} = UpdateSourceParamsSchema.parse(params);

    const cleanUpdateData: any = {};

    Object.entries(updateData).forEach(([key, val]) => {
        if (['createdAt', 'updatedAt'].includes(key)) {
            return;
        }

        cleanUpdateData[key] = val;
    });

    const source = await Source.query(db).patchAndFetchById(id, cleanUpdateData);

    return {
        result: source,
        code: 200,
    };
};

export const deleteSource: ApiFunctionPrototype<DeleteSourceParams, DeleteSourceResponse> = async (
    params,
    db,
) => {
    const deletedCount = await Source.query(db).deleteById(params.id);

    return {
        result: deletedCount,
        code: 200,
    };
};

export const getSourceById: ApiFunctionPrototype<
    GetSourceByIdParams,
    GetSourceByIdResponse
> = async (params, db) => {
    const source = await Source.query(db).findById(params.id);

    return {
        result: source,
        code: 200,
    };
};

export const getSourcesStatisticsByDays: ApiFunctionPrototype<
    SourceStatisticsParams,
    SourceStatisticsResponse
> = async (params, db) => {
    const {days} = params;
    if (!days.length) {
        return {result: {}, code: 200};
    }
    const rows = (await Source.query(db)
        .select(db.raw(`to_char("createdAt", 'YYYY-MM-DD') as day`), db.raw('count(*) as count'))
        .whereIn(db.raw(`to_char("createdAt", 'YYYY-MM-DD')`), days)
        .groupBy('day')) as unknown as Array<{day: string; count: string | number}>;
    const result: Record<string, number> = {};
    for (const row of rows) {
        result[row.day] = Number(row.count);
    }
    for (const day of days) {
        if (!(day in result)) result[day] = 0;
    }
    return {result, code: 200};
};
