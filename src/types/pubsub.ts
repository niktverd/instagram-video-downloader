import {z} from 'zod';

import {
    PublishBulkRunScenarioMessagesByIdsParamsSchema,
    PublishBulkRunScenarioMessagesByIdsResponseSchema,
    PushPubSubTestParamsSchema,
    PushPubSubTestResponseSchema,
} from '#src/types/schemas/handlers/pubsub';

export type PushPubSubTestParams = z.infer<typeof PushPubSubTestParamsSchema>;
export type PushPubSubTestResponse = z.infer<typeof PushPubSubTestResponseSchema>;

export type PublishBulkRunScenarioMessagesByIdsParams = z.infer<
    typeof PublishBulkRunScenarioMessagesByIdsParamsSchema
>;
export type PublishBulkRunScenarioMessagesByIdsResponse = z.infer<
    typeof PublishBulkRunScenarioMessagesByIdsResponseSchema
>;
