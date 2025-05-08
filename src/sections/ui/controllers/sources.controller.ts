import {
    CreateSourceParams,
    CreateSourceParamsSchema,
    CreateSourceResponse,
    DeleteSourceParams,
    DeleteSourceParamsSchema,
    DeleteSourceResponse,
    GetAllSourcesParams,
    GetAllSourcesParamsSchema,
    GetAllSourcesResponse,
    GetOneSourceParams,
    GetOneSourceParamsSchema,
    GetOneSourceResponse,
    UpdateSourceParams,
    UpdateSourceParamsSchema,
    UpdateSourceResponse,
    createSource,
    deleteSource,
    getAllSources,
    getOneSource,
    updateSource,
    wrapper,
} from '../../../db';

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
