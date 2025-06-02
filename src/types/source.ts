import {z} from 'zod';

import {
    DeleteSourceParamsSchema,
    GetAllSourcesParamsSchema,
    GetOneSourceParamsSchema,
    GetSourceByIdParamsSchema,
    SourceStatisticsParamsSchema,
    UpdateSourceParamsSchema,
    // CreateSourceParamsSchema as _CreateSourceParamsSchema,
} from '#schemas/handlers/source';
import {SourceSchema} from '#schemas/models/source';

export type ISource = z.infer<typeof SourceSchema>;

export type CreateSourceParams = Omit<ISource, 'id'>;
export type CreateSourceResponse = ISource;

export type GetAllSourcesParams = z.infer<typeof GetAllSourcesParamsSchema>;
export type GetAllSourcesResponse = {sources: ISource[]; count: number};

export type GetOneSourceParams = z.infer<typeof GetOneSourceParamsSchema>;
export type GetOneSourceResponse = ISource | undefined;

export type UpdateSourceParams = z.infer<typeof UpdateSourceParamsSchema>;
export type UpdateSourceResponse = ISource;

export type DeleteSourceParams = z.infer<typeof DeleteSourceParamsSchema>;
export type DeleteSourceResponse = number;

export type GetSourceByIdParams = z.infer<typeof GetSourceByIdParamsSchema>;
export type GetSourceByIdResponse = ISource | undefined;

export type SourceStatisticsParams = z.infer<typeof SourceStatisticsParamsSchema>;
export type SourceStatisticsResponse = Record<string, number>;
