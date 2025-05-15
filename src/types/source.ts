import {z} from 'zod';

import {
    CreateSourceParamsSchema as _CreateSourceParamsSchema,
    DeleteSourceParamsSchema as _DeleteSourceParamsSchema,
    GetAllSourcesParamsSchema as _GetAllSourcesParamsSchema,
    GetOneSourceParamsSchema as _GetOneSourceParamsSchema,
    GetSourceByIdParamsSchema as _GetSourceByIdParamsSchema,
    UpdateSourceParamsSchema as _UpdateSourceParamsSchema,
} from '#schemas/handlers/source';
import {SourceSchema} from '#schemas/models/source';

export type ISource = z.infer<typeof SourceSchema>;

export type CreateSourceParams = Omit<ISource, 'id'>;
export type CreateSourceResponse = ISource;

export type GetAllSourcesParams = z.infer<typeof _GetAllSourcesParamsSchema>;
export type GetAllSourcesResponse = {sources: ISource[]; count: number};

export type GetOneSourceParams = z.infer<typeof _GetOneSourceParamsSchema>;
export type GetOneSourceResponse = ISource | undefined;

export type UpdateSourceParams = z.infer<typeof _UpdateSourceParamsSchema>;
export type UpdateSourceResponse = ISource;

export type DeleteSourceParams = z.infer<typeof _DeleteSourceParamsSchema>;
export type DeleteSourceResponse = number;

export type GetSourceByIdParams = z.infer<typeof _GetSourceByIdParamsSchema>;
export type GetSourceByIdResponse = ISource | undefined;
