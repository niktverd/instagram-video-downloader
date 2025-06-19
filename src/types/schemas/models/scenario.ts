import {z} from 'zod';

import {createEntitySchema} from './base';
import {InstagramLocationSchema} from './instagram-location';

import {InstagramLocationSource, ScenarioType} from '#src/types/enums';

export const ScenarioSchema = createEntitySchema({
    slug: z.string(),
    type: z.nativeEnum(ScenarioType),
    enabled: z.boolean().optional(),
    onlyOnce: z.boolean().optional(),
    copiedFrom: z.number().nullable().optional(),
    options: z.record(z.any()).optional(),
    texts: z.record(z.any()).optional(),
    instagramLocationSource: z
        .nativeEnum(InstagramLocationSource)
        .default(InstagramLocationSource.Scenario)
        .optional(),

    // added on request
    instagramLocations: z.array(InstagramLocationSchema).optional(),
}).strict();
