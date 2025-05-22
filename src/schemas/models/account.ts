import {z} from 'zod';

import {InstagramLocationSchema} from './instagram-location';
import {ScenarioSchema} from './scenario';

export const AccountSchema = z
    .object({
        id: z.number(),
        slug: z.string(),
        enabled: z.boolean(),
        token: z.string().optional(),
        userIdIG: z.string().optional().nullable(),

        // added on request
        availableScenarios: z.array(ScenarioSchema).optional(),
        instagramLocations: z.array(InstagramLocationSchema).optional(),
    })
    .strict();
