import {
    CreateInstagramMediaContainerParams,
    CreateInstagramMediaContainerParamsSchema,
    CreateInstagramMediaContainerResponse,
    DeleteInstagramMediaContainerParams,
    DeleteInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerResponse,
    GetAllInstagramMediaContainersParams,
    GetAllInstagramMediaContainersParamsSchema,
    GetAllInstagramMediaContainersResponse,
    UpdateInstagramMediaContainerParams,
    UpdateInstagramMediaContainerParamsSchema,
    UpdateInstagramMediaContainerResponse,
    createInstagramMediaContainer,
    deleteInstagramMediaContainer,
    getAllInstagramMediaContainers,
    updateInstagramMediaContainer,
    wrapper,
} from '../../../db';

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
