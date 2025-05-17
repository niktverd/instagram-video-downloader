import {z} from 'zod';

import {
    // CreateInstagramMediaContainerParamsSchema,
    DeleteInstagramMediaContainerParamsSchema,
    GetAllInstagramMediaContainersParamsSchema,
    GetInstagramMediaContainerByIdParamsSchema,
    GetLimitedInstagramMediaContainersParamsSchema,
    UpdateInstagramMediaContainerParamsSchema,
} from '#schemas/handlers/instagramMediaContainer';
import {InstagramMediaContainerSchema} from '#schemas/models/instagramMediaContainer';

export type IInstagramMediaContainer = z.infer<typeof InstagramMediaContainerSchema>;

export type CreateInstagramMediaContainerParams = Omit<IInstagramMediaContainer, 'id'>;
export type CreateInstagramMediaContainerResponse = IInstagramMediaContainer;

export type GetInstagramMediaContainerByIdParams = z.infer<
    typeof GetInstagramMediaContainerByIdParamsSchema
>;
export type GetInstagramMediaContainerByIdResponse = IInstagramMediaContainer;

export type GetAllInstagramMediaContainersParams = z.infer<
    typeof GetAllInstagramMediaContainersParamsSchema
>;
export type GetAllInstagramMediaContainersResponse = IInstagramMediaContainer[];

export type UpdateInstagramMediaContainerParams = z.infer<
    typeof UpdateInstagramMediaContainerParamsSchema
>;
export type UpdateInstagramMediaContainerResponse = IInstagramMediaContainer;

export type DeleteInstagramMediaContainerParams = z.infer<
    typeof DeleteInstagramMediaContainerParamsSchema
>;
export type DeleteInstagramMediaContainerResponse = number;

export type GetLimitedInstagramMediaContainersParams = z.infer<
    typeof GetLimitedInstagramMediaContainersParamsSchema
>;
export type GetLimitedInstagramMediaContainersResponse = IInstagramMediaContainer[];
