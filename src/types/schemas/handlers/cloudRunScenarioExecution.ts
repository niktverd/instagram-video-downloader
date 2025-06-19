import {z} from 'zod';

import {CloudRunScenarioExecutionSchema} from '#src/types/schemas/models/cloudRunScenarioExecution';

export const CloudRunScenarioExecutionParamsSchema = CloudRunScenarioExecutionSchema.omit({
    id: true,
});

export const UpdateCloudRunScenarioExecutionParamsSchema =
    CloudRunScenarioExecutionSchema.partial();

export const GetAllCloudRunScenarioExecutionsParamsSchema = z
    .object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
        messageId: z.string().optional(),
        attempt: z.string().optional(),
        status: z.string().optional(),
        accountId: z.string().optional(),
        scenarioId: z.string().optional(),
        sourceId: z.string().optional(),
        queueName: z.string().optional(),
    })
    .strict();
