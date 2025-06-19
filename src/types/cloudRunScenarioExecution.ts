import {z} from 'zod';

import {GetAllCloudRunScenarioExecutionsParamsSchema} from '#src/types/schemas/handlers/cloudRunScenarioExecution';
import {CloudRunScenarioExecutionSchema} from '#src/types/schemas/models/cloudRunScenarioExecution';

export const CloudRunScenarioExecutionParamsSchema = CloudRunScenarioExecutionSchema.omit({
    id: true,
});

export type CloudRunScenarioExecutionParams = z.infer<typeof CloudRunScenarioExecutionParamsSchema>;

export type ICloudRunScenarioExecution = z.infer<typeof CloudRunScenarioExecutionSchema>;

export type CreateCloudRunScenarioExecutionResponse = ICloudRunScenarioExecution;

export type GetAllCloudRunScenarioExecutionParams = z.infer<
    typeof GetAllCloudRunScenarioExecutionsParamsSchema
>;

export type GetCloudRunScenarioExecutionResponse = {
    executions: ICloudRunScenarioExecution[];
    count: number;
};

export type UpdateCloudRunScenarioExecutionParams = Partial<
    z.infer<typeof CloudRunScenarioExecutionSchema>
>;
export type UpdateCloudRunScenarioExecutionResponse = ICloudRunScenarioExecution | undefined;
