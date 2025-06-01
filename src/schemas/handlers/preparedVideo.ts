import {z} from 'zod';

import {zodOptionalBoolean, zodOptionalNumber, zodOptionalNumberArray} from './utils';

import {PreparedVideoSchema} from '#schemas/models';

export const CreatePreparedVideoParamsSchema = PreparedVideoSchema.omit({id: true});

export const GetPreparedVideoByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const GetAllPreparedVideosParamsSchema = z
    .object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
        scenarioIds: zodOptionalNumberArray(),
        sourceIds: zodOptionalNumberArray(),
        accountIds: zodOptionalNumberArray(),
        findDuplicates: zodOptionalBoolean(),
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

export const FindPreparedVideoDuplicatesParamsSchema = z
    .object({
        accountId: zodOptionalNumber(),
        sourceId: zodOptionalNumber(),
        scenarioId: zodOptionalNumber(),
    })
    .strict();

export const PreparedVideosStatisticsParamsSchema = z
    .object({
        days: z.array(z.string()),
    })
    .strict();

export const HasPreparedVideoBeenCreatedParamsSchema = z
    .object({
        accountId: zodOptionalNumber(),
        scenarioId: zodOptionalNumber(),
        sourceId: zodOptionalNumber(),
    })
    .strict();

export const HasPreparedVideoBeenCreatedResponseSchema = z.boolean();
