import {z} from 'zod';

export const GetAllMediaPostsParamsSchema = z.object({
    limit: z.number().optional(),
    orderByField: z.string().optional(),
    orderDirection: z.string().optional(),
    lastDocumentId: z.string().optional(),
});

export const GetAllMediaPostsResponseSchema = z.object({
    mediaPosts: z.array(z.any()),
    lastDocumentId: z.string().nullable().optional(),
    hasMore: z.boolean(),
});

export const SplitVideoInTheMiddleParamsSchema = z.object({
    id: z.string(),
});
export const SplitVideoInTheMiddleResponseSchema = z.object({
    status: z.string(),
});

export const TestGreenScreenParamsSchema = z.object({
    id: z.string(),
});
export const TestGreenScreenResponseSchema = z.object({
    status: z.string(),
});

export const ConvertImageToVideoParamsSchema = z.object({
    imageUrl: z.string(),
    duration: z.number(),
    pathToSave: z.string().optional(),
});
export const ConvertImageToVideoResponseSchema = z.object({
    status: z.string(),
    path: z.string(),
});
