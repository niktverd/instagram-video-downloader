import {z} from 'zod';

export const InstagramLocationSchema = z
    .object({
        id: z.number().optional(),
        externalId: z.string(),
        externalIdSource: z.string().optional(),
        name: z.string().optional(),
        address: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        group: z.string().optional(),
    })
    .strict();
