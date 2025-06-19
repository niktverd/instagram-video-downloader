import {z} from 'zod';

import {
    DeleteAccountParamsSchema,
    GetAccountByIdParamsSchema,
    GetAccountBySlugParamsSchema,
    GetAllAccountsParamsSchema,
    UpdateAccountParamsSchema,
} from '#src/types/schemas/handlers/account';
import {AccountSchema} from '#src/types/schemas/models/account';

export type IAccount = z.infer<typeof AccountSchema>;

export type CreateAccountParams = Omit<IAccount, 'id'>;
export type CreateAccountResponse = IAccount;

export type GetAccountByIdParams = z.infer<typeof GetAccountByIdParamsSchema>;
export type GetAccountByIdResponse = IAccount;

export type GetAccountBySlugParams = z.infer<typeof GetAccountBySlugParamsSchema>;
export type GetAccountBySlugResponse = IAccount;

export type GetAllAccountsParams = z.infer<typeof GetAllAccountsParamsSchema>;
export type GetAllAccountsResponse = IAccount[];

export type UpdateAccountParams = z.infer<typeof UpdateAccountParamsSchema>;
export type UpdateAccountResponse = IAccount;

export type DeleteAccountParams = z.infer<typeof DeleteAccountParamsSchema>;
export type DeleteAccountResponse = number;
