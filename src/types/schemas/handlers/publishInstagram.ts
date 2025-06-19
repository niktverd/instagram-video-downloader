import {z} from 'zod';

export const PublishIntagramV4Schema = z.object({});
export const PublishIntagramV4ResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
});
