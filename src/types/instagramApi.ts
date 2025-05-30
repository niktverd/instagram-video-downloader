import {z} from 'zod';

import {
    MessageWebhookV3ResponseSchema,
    MessageWebhookV3Schema,
} from '#schemas/handlers/instagramAPI';

export type MessageWebhookV3Params = z.infer<typeof MessageWebhookV3Schema>;
export type MessageWebhookV3Response = z.infer<typeof MessageWebhookV3ResponseSchema>;
