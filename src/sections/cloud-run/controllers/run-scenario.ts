import {runScenarioHandler} from '../components/run-scenario';

import {wrapper} from '#src/db/utils';
import {CloudRunCreateScenarioVideoSchema} from '#src/schemas/handlers/cloud-run';
import {
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse,
} from '#src/types/cloud-run';

export const runScenarioPost = wrapper<
    CloudRunCreateScenarioVideoParams,
    CloudRunCreateScenarioVideoResponse
>(runScenarioHandler, CloudRunCreateScenarioVideoSchema, 'POST');
