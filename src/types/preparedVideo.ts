import {z} from 'zod';

import {
    CreatePreparedVideoParamsSchema as _CreatePreparedVideoParamsSchema,
    DeletePreparedVideoParamsSchema as _DeletePreparedVideoParamsSchema,
    GetAllPreparedVideosParamsSchema as _GetAllPreparedVideosParamsSchema,
    GetOnePreparedVideoParamsSchema as _GetOnePreparedVideoParamsSchema,
    GetPreparedVideoByIdParamsSchema as _GetPreparedVideoByIdParamsSchema,
    UpdatePreparedVideoParamsSchema as _UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
import {PreparedVideoSchema} from '#schemas/models/preparedVideo';

export type IPreparedVideo = z.infer<typeof PreparedVideoSchema>;

export type CreatePreparedVideoParams = Omit<IPreparedVideo, 'id'>;
export type CreatePreparedVideoResponse = IPreparedVideo;

export type GetPreparedVideoByIdParams = z.infer<typeof _GetPreparedVideoByIdParamsSchema>;
export type GetPreparedVideoByIdResponse = IPreparedVideo;

export type GetAllPreparedVideosParams = z.infer<typeof _GetAllPreparedVideosParamsSchema>;
export type GetAllPreparedVideosResponse = IPreparedVideo[];

export type UpdatePreparedVideoParams = z.infer<typeof _UpdatePreparedVideoParamsSchema>;
export type UpdatePreparedVideoResponse = IPreparedVideo;

export type DeletePreparedVideoParams = z.infer<typeof _DeletePreparedVideoParamsSchema>;
export type DeletePreparedVideoResponse = number;

export type GetOnePreparedVideoParams = z.infer<typeof _GetOnePreparedVideoParamsSchema>;
export type GetOnePreparedVideoResponse = IPreparedVideo | undefined;
