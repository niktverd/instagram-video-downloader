import {CloudRunScenarioExecution} from '../types/models/CloudRunScenarioExecution';

import {
    CloudRunScenarioExecutionParams,
    CreateCloudRunScenarioExecutionResponse,
    GetAllCloudRunScenarioExecutionParams,
    GetCloudRunScenarioExecutionResponse,
    UpdateCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionResponse,
} from '#src/types/cloudRunScenarioExecution';
import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';

export const createCloudRunScenarioExecution: ApiFunctionPrototype<
    CloudRunScenarioExecutionParams,
    CreateCloudRunScenarioExecutionResponse
> = async (params, db) => {
    const created = await CloudRunScenarioExecution.query(db).insert(params);
    return {
        result: created,
        code: 200,
    };
};

export const getAllCloudRunScenarioExecution: ApiFunctionPrototype<
    GetAllCloudRunScenarioExecutionParams,
    GetCloudRunScenarioExecutionResponse
> = async (params, db) => {
    const {
        page = '1',
        limit = '10',
        sortBy,
        sortOrder = 'desc',
        messageId,
        attempt,
        status,
        accountId,
        scenarioId,
        sourceId,
        queueName,
    } = params;

    const query = CloudRunScenarioExecution.query(db);

    if (messageId) {
        query.where('messageId', messageId);
    }
    if (typeof attempt !== 'undefined') {
        query.where('attempt', Number(attempt));
    }
    if (status) {
        query.where('status', status);
    }
    if (accountId) {
        query.where('accountId', Number(accountId));
    }
    if (scenarioId) {
        query.where('scenarioId', Number(scenarioId));
    }
    if (sourceId) {
        query.where('sourceId', Number(sourceId));
    }
    if (queueName) {
        query.where('queueName', queueName);
    }

    if (sortBy) {
        query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const result = await query.page(pageNumber - 1, limitNumber);
    return {
        result: {
            executions: result.results,
            count: result.total,
        },
        code: 200,
    };
};

export const updateCloudRunScenarioExecutionStatus: ApiFunctionPrototype<
    UpdateCloudRunScenarioExecutionParams,
    UpdateCloudRunScenarioExecutionResponse
> = async ({id, ...rest}, db) => {
    const updated = await CloudRunScenarioExecution.query(db)
        .patch(rest)
        .where({id})
        .returning('*')
        .first();
    if (!updated) {
        throw new ThrownError('Execution not found', 404);
    }
    return {
        result: updated,
        code: 200,
    };
};
