import {z} from 'zod';

export const AccountSchema = z
    .object({
        id: z.number(),
        slug: z.string(),
        enabled: z.boolean(),
        token: z.string().optional(),
        userIdIG: z.string().optional(),
        availableScenarios: z.any().optional(),
    })
    .strict();
