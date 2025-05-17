import {z} from 'zod';

import {
    // CreatePreparedVideoParamsSchema,
    DeletePreparedVideoParamsSchema,
    GetAllPreparedVideosParamsSchema,
    GetOnePreparedVideoParamsSchema,
    GetPreparedVideoByIdParamsSchema,
    UpdatePreparedVideoParamsSchema,
} from '#schemas/handlers/preparedVideo';
import {PreparedVideoSchema} from '#schemas/models/preparedVideo';

export type IPreparedVideo = z.infer<typeof PreparedVideoSchema>;

export type CreatePreparedVideoParams = Omit<IPreparedVideo, 'id'>;
export type CreatePreparedVideoResponse = IPreparedVideo;

export type GetPreparedVideoByIdParams = z.infer<typeof GetPreparedVideoByIdParamsSchema>;
export type GetPreparedVideoByIdResponse = IPreparedVideo;

export type GetAllPreparedVideosParams = z.infer<typeof GetAllPreparedVideosParamsSchema>;
export type GetAllPreparedVideosResponse = {
    preparedVideos: IPreparedVideo[];
    count: number;
};

export type UpdatePreparedVideoParams = z.infer<typeof UpdatePreparedVideoParamsSchema>;
export type UpdatePreparedVideoResponse = IPreparedVideo;

export type DeletePreparedVideoParams = z.infer<typeof DeletePreparedVideoParamsSchema>;
export type DeletePreparedVideoResponse = number;

export type GetOnePreparedVideoParams = z.infer<typeof GetOnePreparedVideoParamsSchema>;
export type GetOnePreparedVideoResponse = IPreparedVideo | undefined;
