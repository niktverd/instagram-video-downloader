import {z} from 'zod';

import {ScenarioSchema} from '#schemas/models';

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

export const UpdateScenarioParamsSchema = CreateScenarioParamsSchema.partial()
    .extend({
        id: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })
    .strict();

export const DeleteScenarioParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();
