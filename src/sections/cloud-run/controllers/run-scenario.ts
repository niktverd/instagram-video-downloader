import {runScenarioHandler} from '../components/run-scenario';

import {wrapper} from '#src/db/utils';
import {
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse,
} from '#src/types/cloud-run';
import {CloudRunCreateScenarioVideoSchema} from '#src/types/schemas/handlers/cloud-run';

export const runScenarioPost = wrapper<
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse
>(runScenarioHandler, CloudRunCreateScenarioVideoSchema, 'POST');
