import {
    createSource,
    deleteSource,
    getAllSources,
    getOneSource,
    getSourcesStatisticsByDays,
    updateSource,
    wrapper,
} from '../../../db';

import {
    CreateSourceParamsSchema,
    DeleteSourceParamsSchema,
    GetAllSourcesParamsSchema,
    GetOneSourceParamsSchema,
    SourceStatisticsParamsSchema,
    UpdateSourceParamsSchema,
} from '#src/types/schemas/handlers/source';
import {
    CreateSourceParams,
    CreateSourceResponse,
    DeleteSourceParams,
    DeleteSourceResponse,
    GetAllSourcesParams,
    GetAllSourcesResponse,
    GetOneSourceParams,
    GetOneSourceResponse,
    SourceStatisticsParams,
    SourceStatisticsResponse,
    UpdateSourceParams,
    UpdateSourceResponse,
} from '#types';

export const getAllSourcesGet = wrapper<GetAllSourcesParams, GetAllSourcesResponse>(
    getAllSources,
    GetAllSourcesParamsSchema,
    'GET',
);

export const getOneSourceGet = wrapper<GetOneSourceParams, GetOneSourceResponse>(
    getOneSource,
    GetOneSourceParamsSchema,
    'GET',
);

export const updateSourcePatch = wrapper<UpdateSourceParams, UpdateSourceResponse>(
    updateSource,
    UpdateSourceParamsSchema,
    'PATCH',
);

export const createSourcePost = wrapper<CreateSourceParams, CreateSourceResponse>(
    createSource,
    CreateSourceParamsSchema,
    'POST',
);

export const deleteSourceDelete = wrapper<DeleteSourceParams, DeleteSourceResponse>(
    deleteSource,
    DeleteSourceParamsSchema,
    'DELETE',
);

export const getSourcesStatisticsByDaysGet = wrapper<
    SourceStatisticsParams,
    SourceStatisticsResponse
>(getSourcesStatisticsByDays, SourceStatisticsParamsSchema, 'GET');
