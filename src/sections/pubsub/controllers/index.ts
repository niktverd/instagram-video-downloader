import {wrapper} from '../../../db';
import {publishBulkRunScenarioMessagesByIds, pushPubSubTest} from '../components';

import {
    PublishBulkRunScenarioMessagesByIdsParamsSchema,
    PushPubSubTestParamsSchema,
} from '#schemas/handlers/pubsub';
import {
    PublishBulkRunScenarioMessagesByIdsParams,
    PublishBulkRunScenarioMessagesByIdsResponse,
    PushPubSubTestParams,
    PushPubSubTestResponse,
} from '#src/types/pubsub';

export const pushPubSubTestPost = wrapper<PushPubSubTestParams, PushPubSubTestResponse>(
    pushPubSubTest,
    PushPubSubTestParamsSchema,
    'POST',
);

export const publishBulkRunScenarioMessagesByIdsPost = wrapper<
    PublishBulkRunScenarioMessagesByIdsParams,
    PublishBulkRunScenarioMessagesByIdsResponse
>(publishBulkRunScenarioMessagesByIds, PublishBulkRunScenarioMessagesByIdsParamsSchema, 'POST');
