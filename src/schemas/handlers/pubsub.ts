import {z} from 'zod';

export const PushPubSubTestParamsSchema = z.object({
    accountId: z.string().optional(),
    scenarioId: z.string().optional(),
    sourceId: z.string().optional(),
});

export const PushPubSubTestResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    topic: z.string().optional(),
    authMethod: z.string().optional(),
    error: z.string().optional(),
    errorMessage: z.string().optional(),
});

export const PublishBulkRunScenarioMessagesByIdsParamsSchema = z.object({
    sourceIds: z.array(z.number()),
    accountIds: z.array(z.number()),
    scenarioIds: z.array(z.number()),
});

export const PublishBulkRunScenarioMessagesByIdsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional(),
    errorMessage: z.string().optional(),
});
