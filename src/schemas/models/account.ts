import {z} from 'zod';

import {createEntitySchema} from './base';
import {InstagramLocationSchema} from './instagram-location';
import {ScenarioSchema} from './scenario';

export const AccountSchema = createEntitySchema({
    slug: z.string(),
    enabled: z.boolean(),
    token: z.string().optional(),
    userIdIG: z.string().optional().nullable(),

    // added on request
    availableScenarios: z.array(ScenarioSchema).optional(),
    instagramLocations: z.array(InstagramLocationSchema).optional(),
}).strict();
