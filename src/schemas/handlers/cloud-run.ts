import {z} from 'zod';

export const CloudRunCreateScenarioVideoSchema = z.object({
    accountId: z.coerce.number(),
    scenarioId: z.coerce.number(),
    sourceId: z.coerce.number(),
});
