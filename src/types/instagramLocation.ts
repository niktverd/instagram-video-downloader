import {z} from 'zod';

import {
    CreateInstagramLocationParamsSchema,
    DeleteInstagramLocationParamsSchema,
    GetAllInstagramLocationsParamsSchema,
    GetInstagramLocationByIdParamsSchema,
    UpdateInstagramLocationParamsSchema,
} from '#schemas/handlers/instagramLocation';
import {InstagramLocationSchema} from '#schemas/models/instagram-location';

export type IInstagramLocation = z.infer<typeof InstagramLocationSchema>;

export type CreateInstagramLocationParams = z.infer<typeof CreateInstagramLocationParamsSchema>;
export type CreateInstagramLocationResponse = IInstagramLocation;

export type GetInstagramLocationByIdParams = z.infer<typeof GetInstagramLocationByIdParamsSchema>;
export type GetInstagramLocationByIdResponse = IInstagramLocation;

export type GetAllInstagramLocationsParams = z.infer<typeof GetAllInstagramLocationsParamsSchema>;
export type GetAllInstagramLocationsResponse = {
    locations: IInstagramLocation[];
    count: number;
};

export type UpdateInstagramLocationParams = z.infer<typeof UpdateInstagramLocationParamsSchema>;
export type UpdateInstagramLocationResponse = IInstagramLocation;

export type DeleteInstagramLocationParams = z.infer<typeof DeleteInstagramLocationParamsSchema>;
export type DeleteInstagramLocationResponse = number;
