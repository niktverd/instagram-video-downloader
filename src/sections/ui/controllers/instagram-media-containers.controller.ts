import {
    createInstagramMediaContainer,
    deleteInstagramMediaContainer,
    getAllInstagramMediaContainers,
    updateInstagramMediaContainer,
    wrapper,
} from '../../../db';

import {
    CreateInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerParamsSchema,
    GetAllInstagramMediaContainersParamsSchema,
    UpdateInstagramMediaContainerParamsSchema,
} from '#schemas/handlers/instagramMediaContainer';
import {
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerResponse,
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerResponse,
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersResponse,
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
