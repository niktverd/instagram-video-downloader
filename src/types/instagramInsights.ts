import {z} from 'zod';

import {
    GetAllCommentsForPostsParamsSchema,
    GetAllCommentsForPostsResponseSchema,
    GetInstagramAccountInsightsParamsSchema,
    GetInstagramAccountInsightsResponseSchema,
    UiGetInsightsParamsSchema,
    UiGetInsightsResponseSchema,
    UiGetInstagramMediaParamsSchema,
    UiGetInstagramMediaResponseSchema,
    UiGetInstagramUserIdByMediaIdParamsSchema,
    UiGetInstagramUserIdByMediaIdResponseSchema,
    UiGetUserContentParamsSchema,
    UiGetUserContentResponseSchema,
} from '#src/types/schemas/handlers/instagramAPI';

export type GetInstagramAccountInsightsParams = z.infer<
    typeof GetInstagramAccountInsightsParamsSchema
>;
export type GetInstagramAccountInsightsResponse = z.infer<
    typeof GetInstagramAccountInsightsResponseSchema
>;

export type GetAllCommentsForPostsParams = z.infer<typeof GetAllCommentsForPostsParamsSchema>;
export type GetAllCommentsForPostsResponse = z.infer<typeof GetAllCommentsForPostsResponseSchema>;

export type UiGetInsightsParams = z.infer<typeof UiGetInsightsParamsSchema>;
export type UiGetInsightsResponse = z.infer<typeof UiGetInsightsResponseSchema>;

export type UiGetInstagramMediaParams = z.infer<typeof UiGetInstagramMediaParamsSchema>;
export type UiGetInstagramMediaResponse = z.infer<typeof UiGetInstagramMediaResponseSchema>;

export type UiGetInstagramUserIdByMediaIdParams = z.infer<
    typeof UiGetInstagramUserIdByMediaIdParamsSchema
>;
export type UiGetInstagramUserIdByMediaIdResponse = z.infer<
    typeof UiGetInstagramUserIdByMediaIdResponseSchema
>;

export type UiGetUserContentParams = z.infer<typeof UiGetUserContentParamsSchema>;
export type UiGetUserContentResponse = z.infer<typeof UiGetUserContentResponseSchema>;
