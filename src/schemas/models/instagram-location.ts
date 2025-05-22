import {z} from 'zod';

import {createEntitySchema} from './base';

export const InstagramLocationSchema = createEntitySchema({
    externalId: z.string(),
    externalIdSource: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    group: z.string().optional().nullable(),
}).strict();
