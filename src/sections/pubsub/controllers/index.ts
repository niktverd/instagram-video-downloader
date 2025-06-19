import {wrapper} from '../../../db';
import {publishBulkRunScenarioMessagesByIds, pushPubSubTest} from '../components';

import {
    PublishBulkRunScenarioMessagesByIdsParams,
    PublishBulkRunScenarioMessagesByIdsResponse,
    PushPubSubTestParams,
    PushPubSubTestResponse,
} from '#src/types/pubsub';
import {
    PublishBulkRunScenarioMessagesByIdsParamsSchema,
    PushPubSubTestParamsSchema,
} from '#src/types/schemas/handlers/pubsub';

export const pushPubSubTestPost = wrapper<PushPubSubTestParams, PushPubSubTestResponse>(
    pushPubSubTest,
    PushPubSubTestParamsSchema,
    'POST',
);

export const publishBulkRunScenarioMessagesByIdsPost = wrapper<
    PublishBulkRunScenarioMessagesByIdsParams,
    PublishBulkRunScenarioMessagesByIdsResponse
>(publishBulkRunScenarioMessagesByIds, PublishBulkRunScenarioMessagesByIdsParamsSchema, 'POST');
