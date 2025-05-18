import {z} from 'zod';

import {PreparedVideoSchema} from '#schemas/models';
import {queryToNumberArray} from '#utils';

export const CreatePreparedVideoParamsSchema = PreparedVideoSchema.omit({id: true});

export const GetPreparedVideoByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

const zodOptionalNumberArray = () =>
    z
        .preprocess(queryToNumberArray, z.array(z.number()))
        .optional()
        .transform((x) => (x === undefined ? undefined : (x as number[]))) as unknown as z.ZodType<
        number[] | undefined
    >;

export const GetAllPreparedVideosParamsSchema = z
    .object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
        scenarioIds: zodOptionalNumberArray(),
        sourceIds: zodOptionalNumberArray(),
        accountIds: zodOptionalNumberArray(),
    })
    .strict();

export const UpdatePreparedVideoParamsSchema = CreatePreparedVideoParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export const DeletePreparedVideoParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const GetOnePreparedVideoParamsSchema = z
    .object({
        hasFirebaseUrl: z.boolean().optional(),
        firebaseUrl: z.string().optional(),
        duration: z.number().optional(),
        scenarioId: z.number().optional(),
        sourceId: z.number().optional(),
        accountId: z.number().optional(),
        random: z.boolean().optional(),
        notInInstagramMediaContainers: z.boolean().optional(),
        fetchGraphAccount: z.boolean().optional(),
        fetchGraphScenario: z.boolean().optional(),
        fetchGraphSource: z.boolean().optional(),
    })
    .strict();
