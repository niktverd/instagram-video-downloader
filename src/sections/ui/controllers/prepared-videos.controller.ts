import {
    createPreparedVideo,
    deletePreparedVideo,
    findPreparedVideoDuplicates,
    getAllPreparedVideos,
    getPreparedVideoById,
    updatePreparedVideo,
    wrapper,
} from '../../../db';

import {
    CreatePreparedVideoParamsSchema,
    DeletePreparedVideoParamsSchema,
    FindPreparedVideoDuplicatesParamsSchema,
    GetAllPreparedVideosParamsSchema,
    GetPreparedVideoByIdParamsSchema,
    UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
import {
    CreatePreparedVideoParams,
    CreatePreparedVideoResponse,
    DeletePreparedVideoParams,
    DeletePreparedVideoResponse,
    FindPreparedVideoDuplicatesParams,
    FindPreparedVideoDuplicatesResponse,
    GetAllPreparedVideosParams,
    GetAllPreparedVideosResponse,
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdResponse,
    UpdatePreparedVideoParams,
    UpdatePreparedVideoResponse,
} from '#types';

export const createPreparedVideoPost = wrapper<
    CreatePreparedVideoParams,
    CreatePreparedVideoResponse
>(createPreparedVideo, CreatePreparedVideoParamsSchema, 'POST');

export const updatePreparedVideoPatch = wrapper<
    UpdatePreparedVideoParams,
    UpdatePreparedVideoResponse
>(updatePreparedVideo, UpdatePreparedVideoParamsSchema, 'PATCH');

export const getPreparedVideoByIdGet = wrapper<
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdResponse
>(getPreparedVideoById, GetPreparedVideoByIdParamsSchema, 'GET');

export const getAllPreparedVideosGet = wrapper<
    GetAllPreparedVideosParams,
    GetAllPreparedVideosResponse
>(getAllPreparedVideos, GetAllPreparedVideosParamsSchema, 'GET');

export const deletePreparedVideoDelete = wrapper<
    DeletePreparedVideoParams,
    DeletePreparedVideoResponse
>(deletePreparedVideo, DeletePreparedVideoParamsSchema, 'DELETE');

export const findPreparedVideoDuplicatesGet = wrapper<
    FindPreparedVideoDuplicatesParams,
    FindPreparedVideoDuplicatesResponse
>(findPreparedVideoDuplicates, FindPreparedVideoDuplicatesParamsSchema, 'GET');
