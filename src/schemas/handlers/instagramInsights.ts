import {z} from 'zod';

export const GetInstagramAccountInsightsParamsSchema = z
    .object({
        accessToken: z.string(),
    })
    .strict();

export const GetInstagramAccountInsightsResponseSchema = z.any();
