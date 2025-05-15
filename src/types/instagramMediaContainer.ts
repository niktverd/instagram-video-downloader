import {z} from 'zod';

import {
    CreateInstagramMediaContainerParamsSchema as _CreateInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerParamsSchema as _DeleteInstagramMediaContainerParamsSchema,
    GetAllInstagramMediaContainersParamsSchema as _GetAllInstagramMediaContainersParamsSchema,
    GetInstagramMediaContainerByIdParamsSchema as _GetInstagramMediaContainerByIdParamsSchema,
    GetLimitedInstagramMediaContainersParamsSchema as _GetLimitedInstagramMediaContainersParamsSchema,
    UpdateInstagramMediaContainerParamsSchema as _UpdateInstagramMediaContainerParamsSchema,
} from '#schemas/handlers/instagramMediaContainer';
import {InstagramMediaContainerSchema} from '#schemas/models/instagramMediaContainer';

export type IInstagramMediaContainer = z.infer<typeof InstagramMediaContainerSchema>;

export type CreateInstagramMediaContainerParams = Omit<IInstagramMediaContainer, 'id'>;
export type CreateInstagramMediaContainerResponse = IInstagramMediaContainer;

export type GetInstagramMediaContainerByIdParams = z.infer<
    typeof _GetInstagramMediaContainerByIdParamsSchema
>;
export type GetInstagramMediaContainerByIdResponse = IInstagramMediaContainer;

export type GetAllInstagramMediaContainersParams = z.infer<
    typeof _GetAllInstagramMediaContainersParamsSchema
>;
export type GetAllInstagramMediaContainersResponse = IInstagramMediaContainer[];

export type UpdateInstagramMediaContainerParams = z.infer<
    typeof _UpdateInstagramMediaContainerParamsSchema
>;
export type UpdateInstagramMediaContainerResponse = IInstagramMediaContainer;

export type DeleteInstagramMediaContainerParams = z.infer<
    typeof _DeleteInstagramMediaContainerParamsSchema
>;
export type DeleteInstagramMediaContainerResponse = number;

export type GetLimitedInstagramMediaContainersParams = z.infer<
    typeof _GetLimitedInstagramMediaContainersParamsSchema
>;
export type GetLimitedInstagramMediaContainersResponse = IInstagramMediaContainer[];
