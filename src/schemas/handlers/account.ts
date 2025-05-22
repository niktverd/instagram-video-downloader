import {z} from 'zod';

import {zodOptionalBoolean} from './utils';

import {AccountSchema} from '#schemas/models';

export const CreateAccountParamsSchema = AccountSchema.omit({id: true});
export const GetAccountByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export const GetAccountBySlugParamsSchema = z
    .object({
        slug: z.string(),
    })
    .strict();

export const GetAllAccountsParamsSchema = z
    .object({
        onlyEnabled: zodOptionalBoolean(),
    })
    .strict();

export const UpdateAccountParamsSchema = CreateAccountParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export const DeleteAccountParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();
