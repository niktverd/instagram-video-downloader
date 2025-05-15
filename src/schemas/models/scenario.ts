import {z} from 'zod';

import {ScenarioType} from '#src/types/enums';

export const ScenarioSchema = z
    .object({
        id: z.number(),
        slug: z.string(),
        type: z.nativeEnum(ScenarioType),
        enabled: z.boolean().optional(),
        onlyOnce: z.boolean().optional(),
        copiedFrom: z.number().nullable().optional(),
        options: z.record(z.any()).optional(),
        texts: z.record(z.any()).optional(),
    })
    .strict();
