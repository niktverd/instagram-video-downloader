import {z} from 'zod';

import {createEntitySchema} from './base';

import {zodNumber, zodOptionalNumber} from '#schemas/handlers/utils';
import {CloudRunScenarioExecutionStatusEnum} from '#src/types/enums';

export const CloudRunScenarioExecutionSchema = createEntitySchema({
    id: zodNumber(),
    messageId: z.string(),
    accountId: zodOptionalNumber(),
    scenarioId: zodOptionalNumber(),
    sourceId: zodOptionalNumber(),
    status: z.nativeEnum(CloudRunScenarioExecutionStatusEnum),
    reqId: z.string(),
    attempt: z.number(),
    queueName: z.string(),
    traceId: z.string().optional(),
    errorDetails: z.string().optional(),
    artifactPath: z.string().optional(),
    startedAt: z.string().datetime().optional(),
    finishedAt: z.string().datetime().optional(),
    duration: z.number().optional(),
    cancelled: z.boolean().optional(),
    userId: z.string().optional(),
}).strict();
