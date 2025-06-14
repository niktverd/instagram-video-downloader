import {z} from 'zod';

export const GetInstagramAccountInsightsParamsSchema = z
    .object({
        accessToken: z.string(),
        period: z.enum(['day', 'week', 'month', 'year']).optional(),
    })
    .strict();
export const GetInstagramAccountInsightsResponseSchema = z.any();

export const GetAllCommentsForPostsParamsSchema = z
    .object({
        accessToken: z.string().optional(),
    })
    .strict();
export const GetAllCommentsForPostsResponseSchema = z.any();

export const UiGetInsightsParamsSchema = z.object({
    id: z.number(),
});
export const UiGetInsightsResponseSchema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            period: z.string(),
            values: z.array(z.object({value: z.number(), end_time: z.string()})),
        }),
    ),
});

export const UiGetInstagramMediaParamsSchema = z.object({
    id: z.string(),
    accessToken: z.string().optional(),
});
export const UiGetInstagramMediaResponseSchema = z.any();

export const UiGetInstagramUserIdByMediaIdParamsSchema = z.object({
    id: z.string(),
    reelVideoId: z.string(),
});
export const UiGetInstagramUserIdByMediaIdResponseSchema = z.any();

export const UiGetUserContentParamsSchema = z.object({
    accountName: z.string().optional(),
    accessToken: z.string().optional(),
});
export const UiGetUserContentResponseSchema = z.any();

export const MessageWebhookV3Schema = z.any();
export const MessageWebhookV3ResponseSchema = z.any();
