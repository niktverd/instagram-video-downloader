import {z} from 'zod';

import {
    ConvertImageToVideoParamsSchema,
    ConvertImageToVideoResponseSchema,
    GetAllMediaPostsParamsSchema,
    GetAllMediaPostsResponseSchema,
    SplitVideoInTheMiddleParamsSchema,
    SplitVideoInTheMiddleResponseSchema,
    TestGreenScreenParamsSchema,
    TestGreenScreenResponseSchema,
} from '#schemas/handlers/uiCommon';

export type GetAllMediaPostsParams = z.infer<typeof GetAllMediaPostsParamsSchema>;
export type GetAllMediaPostsResponse = z.infer<typeof GetAllMediaPostsResponseSchema>;

export type SplitVideoInTheMiddleParams = z.infer<typeof SplitVideoInTheMiddleParamsSchema>;
export type SplitVideoInTheMiddleResponse = z.infer<typeof SplitVideoInTheMiddleResponseSchema>;

export type TestGreenScreenParams = z.infer<typeof TestGreenScreenParamsSchema>;
export type TestGreenScreenResponse = z.infer<typeof TestGreenScreenResponseSchema>;

export type ConvertImageToVideoParams = z.infer<typeof ConvertImageToVideoParamsSchema>;
export type ConvertImageToVideoResponse = z.infer<typeof ConvertImageToVideoResponseSchema>;
