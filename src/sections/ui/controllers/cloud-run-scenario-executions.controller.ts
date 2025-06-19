import {
    createCloudRunScenarioExecution,
    getAllCloudRunScenarioExecution,
    updateCloudRunScenarioExecutionStatus,
} from '#src/db/cloudRunScenarioExecutions';
import {wrapper} from '#src/db/utils';
import {
    CloudRunScenarioExecutionParams,
    CreateCloudRunScenarioExecutionResponse,
    GetAllCloudRunScenarioExecutionParams,
    GetCloudRunScenarioExecutionResponse,
    UpdateCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionResponse,
} from '#src/types/cloudRunScenarioExecution';
import {
    CloudRunScenarioExecutionParamsSchema,
    GetAllCloudRunScenarioExecutionsParamsSchema,
    UpdateCloudRunScenarioExecutionParamsSchema,
} from '#src/types/schemas/handlers/cloudRunScenarioExecution';

export const createCloudRunScenarioExecutionPost = wrapper<
    CloudRunScenarioExecutionParams,
    CreateCloudRunScenarioExecutionResponse
>(createCloudRunScenarioExecution, CloudRunScenarioExecutionParamsSchema, 'POST');

export const getAllCloudRunScenarioExecutionGet = wrapper<
    GetAllCloudRunScenarioExecutionParams,
    GetCloudRunScenarioExecutionResponse
>(getAllCloudRunScenarioExecution, GetAllCloudRunScenarioExecutionsParamsSchema, 'GET');

export const updateCloudRunScenarioExecutionStatusPatch = wrapper<
    UpdateCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionResponse
>(updateCloudRunScenarioExecutionStatus, UpdateCloudRunScenarioExecutionParamsSchema, 'PATCH');
