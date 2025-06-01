import {
    createCloudRunScenarioExecution,
    getAllCloudRunScenarioExecution,
    updateCloudRunScenarioExecutionStatus,
} from '#src/db/cloudRunScenarioExecutions';
import {wrapper} from '#src/db/utils';
import {
    CloudRunScenarioExecutionParamsSchema,
    GetAllCloudRunScenarioExecutionsParamsSchema,
    UpdateCloudRunScenarioExecutionParamsSchema,
} from '#src/schemas/handlers/cloudRunScenarioExecution';
import {
    CloudRunScenarioExecutionParams,
    CreateCloudRunScenarioExecutionResponse,
    GetAllCloudRunScenarioExecutionParams,
    GetCloudRunScenarioExecutionResponse,
    UpdateCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionResponse,
} from '#src/types/cloudRunScenarioExecution';

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
