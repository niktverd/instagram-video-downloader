import {z} from 'zod';

// Schema for the body in a Pub/Sub push message
export const CloudRunCreateScenarioVideoSchema = z.object({
    message: z.object({
        data: z.string(), // Base64 encoded string
        messageId: z.string(),
        publishTime: z.string(),
        attributes: z.record(z.string()).optional(),
    }),
    subscription: z.string().optional(),
});
