import {z} from 'zod';

import {ScenarioType} from '#schemas/scenario';

export const AccountSchema = z
    .object({
        id: z.number(),
        slug: z.string(),
        enabled: z.boolean(),
        token: z.string().optional(),
        availableScenarios: z.any().optional(),
    })
    .strict();
export type IAccount = z.infer<typeof AccountSchema>;

export const InstagramMediaContainerSchema = z
    .object({
        id: z.number(),
        preparedVideoId: z.number(),
        lastCheckedIGStatus: z.string(),
        isPublished: z.boolean(),
        attempts: z.number(),
        error: z.string().optional(),
        containerId: z.string().optional(),
        mediaId: z.string().optional(),
        caption: z.string().optional(),
        audioName: z.string().optional(),
        location: z.any().optional(),
        hashtags: z.array(z.string()).optional(),
        isBlocked: z.boolean(),
        blockedReason: z.string().optional(),
    })
    .strict();
export type IInstagramMediaContainer = z.infer<typeof InstagramMediaContainerSchema>;

// export const ScenarioTextsSchema = z.object({
//     intro: z.array(z.string()),
//     main: z.array(z.string()),
//     outro: z.array(z.string()),
// });

export const ScenarioSchema = z
    .object({
        id: z.number(),
        slug: z.string(),
        type: z.nativeEnum(ScenarioType),
        enabled: z.boolean().optional(),
        onlyOnce: z.boolean().optional(),
        copiedFrom: z.number().nullable().optional(),
        options: z.record(z.any()).optional(),
        texts: z.record(z.any()).optional(),
    })
    .strict();
export type IScenario = z.infer<typeof ScenarioSchema>;

export const SourceSchema = z
    .object({
        id: z.number(),
        firebaseUrl: z.string().optional(),
        sources: z.record(z.any()),
        bodyJSONString: z.record(z.any()).optional(),
        duration: z.number().optional(),
        attempt: z.number().optional(),
        lastUsed: z.string().optional(),
        sender: z.string().optional(),
        recipient: z.string().optional(),
    })
    .strict();
export type ISource = z.infer<typeof SourceSchema>;

export const PreparedVideoSchema = z.object({
    id: z.number(),
    firebaseUrl: z.string(),
    duration: z.number().optional(),
    scenarioId: z.number(),
    sourceId: z.number(),
    accountId: z.number(),
    scenario: ScenarioSchema.optional(),
    source: SourceSchema.optional(),
    account: AccountSchema.optional(),
});
export type IPreparedVideo = z.infer<typeof PreparedVideoSchema>;
