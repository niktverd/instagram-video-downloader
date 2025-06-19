import {z} from 'zod';

import {ScenarioSchema} from '#src/types/schemas/models';

export const CreateScenarioParamsSchema = ScenarioSchema.omit({id: true});

export const GetScenarioByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const GetScenarioBySlugParamsSchema = z
    .object({
        slug: z.string(),
    })
    .strict();

export const GetAllScenariosParamsSchema = z.object({}).strict();

export const UpdateScenarioParamsSchema = ScenarioSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export const DeleteScenarioParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();
