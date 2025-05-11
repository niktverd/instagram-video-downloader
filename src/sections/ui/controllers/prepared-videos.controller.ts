import {
    CreatePreparedVideoParams,
    CreatePreparedVideoParamsSchema,
    CreatePreparedVideoResponse,
    DeletePreparedVideoParams,
    DeletePreparedVideoParamsSchema,
    DeletePreparedVideoResponse,
    GetAllPreparedVideosParams,
    GetAllPreparedVideosParamsSchema,
    GetAllPreparedVideosResponse,
    GetPreparedVideoByIdParams,
    GetPreparedVideoByIdParamsSchema,
    GetPreparedVideoByIdResponse,
    UpdatePreparedVideoParams,
    UpdatePreparedVideoParamsSchema,
    UpdatePreparedVideoResponse,
    createPreparedVideo,
    deletePreparedVideo,
    getAllPreparedVideos,
    getPreparedVideoById,
    updatePreparedVideo,
    wrapper,
} from '../../../db';

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
