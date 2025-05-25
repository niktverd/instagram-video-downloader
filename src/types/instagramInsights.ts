import {z} from 'zod';

import {
    GetInstagramAccountInsightsParamsSchema,
    GetInstagramAccountInsightsResponseSchema,
} from '#schemas/handlers/instagramInsights';

export type GetInstagramAccountInsightsParams = z.infer<
    typeof GetInstagramAccountInsightsParamsSchema
>;
export type GetInstagramAccountInsightsResponse = z.infer<
    typeof GetInstagramAccountInsightsResponseSchema
>;
