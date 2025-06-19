import {z} from 'zod';

import {createEntitySchema} from './base';

import {CloudRunScenarioExecutionStatusEnum} from '#src/types/enums';
import {zodNumber, zodOptionalNumber} from '#src/types/schemas/handlers/utils';

export const CloudRunScenarioExecutionSchema = createEntitySchema({
    id: zodNumber(),
    messageId: z.string(),
    accountId: zodOptionalNumber(),
    scenarioId: zodOptionalNumber(),
    sourceId: zodOptionalNumber(),
    status: z.nativeEnum(CloudRunScenarioExecutionStatusEnum),
    reqId: z.string().optional(),
    attempt: z.number(),
    queueName: z.string().optional(),
    traceId: z.string().optional(),
    errorDetails: z.string().optional(),
    artifactPath: z.string().optional(),
    startedAt: z.string().datetime().optional(),
    finishedAt: z.string().datetime().optional(),
    duration: z.number().optional(),
    cancelled: z.boolean().optional(),
    userId: z.string().optional(),
}).strict();
