import {
    createInstagramMediaContainer,
    deleteInstagramMediaContainer,
    getAllInstagramMediaContainers,
    getInstagramMediaContainerById,
    updateInstagramMediaContainer,
    wrapper,
} from '../../../db';

import {
    CreateInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerParamsSchema,
    GetAllInstagramMediaContainersParamsSchema,
    GetInstagramMediaContainerByIdParamsSchema,
    UpdateInstagramMediaContainerParamsSchema,
} from '#schemas/handlers/instagramMediaContainer';
import {
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerResponse,
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerResponse,
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersResponse,
    GetInstagramMediaContainerByIdParams,
    GetInstagramMediaContainerByIdResponse,
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerResponse,
} from '#types';

export const getAllInstagramMediaContainersGet = wrapper<
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersResponse
>(getAllInstagramMediaContainers, GetAllInstagramMediaContainersParamsSchema, 'GET');

export const updateInstagramMediaContainerPatch = wrapper<
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerResponse
>(updateInstagramMediaContainer, UpdateInstagramMediaContainerParamsSchema, 'PATCH');

export const createInstagramMediaContainerPost = wrapper<
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerResponse
>(createInstagramMediaContainer, CreateInstagramMediaContainerParamsSchema, 'POST');

export const deleteInstagramMediaContainerDelete = wrapper<
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerResponse
>(deleteInstagramMediaContainer, DeleteInstagramMediaContainerParamsSchema, 'DELETE');

export const getInstagramMediaContainerByIdGet = wrapper<
    GetInstagramMediaContainerByIdParams,
    GetInstagramMediaContainerByIdResponse
>(getInstagramMediaContainerById, GetInstagramMediaContainerByIdParamsSchema, 'GET');
