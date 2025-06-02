import {BaseModel} from './BaseModel';

import {CloudRunScenarioExecutionStatusEnum, ICloudRunScenarioExecution} from '#types';

export class CloudRunScenarioExecution extends BaseModel implements ICloudRunScenarioExecution {
    id!: number;
    messageId!: string;
    accountId!: number;
    scenarioId!: number;
    sourceId!: number;
    status!: CloudRunScenarioExecutionStatusEnum;
    reqId!: string;
    attempt!: number;
    queueName!: string;
    traceId?: string;
    errorDetails?: string;
    artifactPath?: string;
    startedAt?: string;
    finishedAt?: string;
    duration?: number;
    cancelled?: boolean;
    userId?: string;

    static get tableName() {
        return 'cloudRunScenarioExecutions';
    }
    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        return {};
    }
}
