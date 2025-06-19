import {z} from 'zod';

import {CloudRunCreateScenarioVideoSchema} from '#src/types/schemas/handlers/cloud-run';

export type CloudRunCreateScenarioVideoParams = z.infer<typeof CloudRunCreateScenarioVideoSchema>;
export type CloudRunCreateScenarioVideoResponse = undefined;
