import {z} from 'zod';

export const InstagramMediaContainerSchema = z
    .object({
        id: z.number(),
        preparedVideoId: z.number(),
        accountId: z.number(),
        lastCheckedIGStatus: z.string().optional(),
        isPublished: z.boolean().optional(),
        attempts: z.number().optional(),
        error: z.string().optional(),
        containerId: z.string().optional(),
        mediaId: z.string().optional(),
        caption: z.string().optional(),
        audioName: z.string().optional(),
        location: z.any().optional(),
        hashtags: z.array(z.string()).optional(),
        isBlocked: z.boolean().optional(),
        blockedReason: z.string().optional(),
    })
    .strict();
