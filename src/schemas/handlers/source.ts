import {z} from 'zod';

import {zodOptionalBoolean} from './utils';

import {SourceSchema} from '#schemas/models';

export const CreateSourceParamsSchema = SourceSchema.omit({id: true});

export const GetAllSourcesParamsSchema = z
    .object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
        notInThePreparedVideos: zodOptionalBoolean(),
    })
    .strict();

export const GetOneSourceParamsSchema = z
    .object({
        id: z.number().optional(),
        random: z.boolean().optional(),
        emptyFirebaseUrl: z.boolean().optional(),
    })
    .strict();

export const UpdateSourceParamsSchema = SourceSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export const DeleteSourceParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const GetSourceByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const SourceStatisticsParamsSchema = z
    .object({
        days: z.array(z.string()),
    })
    .strict();
