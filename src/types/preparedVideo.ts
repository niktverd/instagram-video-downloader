import {z} from 'zod';

import {
    // CreatePreparedVideoParamsSchema,
    DeletePreparedVideoParamsSchema,
    FindPreparedVideoDuplicatesParamsSchema,
    GetAllPreparedVideosParamsSchema,
    GetOnePreparedVideoParamsSchema,
    GetPreparedVideoByIdParamsSchema,
    HasPreparedVideoBeenCreatedParamsSchema,
    HasPreparedVideoBeenCreatedResponseSchema,
    PreparedVideosStatisticsParamsSchema,
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

export type FindPreparedVideoDuplicatesParams = z.infer<
    typeof FindPreparedVideoDuplicatesParamsSchema
>;
export type FindPreparedVideoDuplicatesResponse = IPreparedVideo[];

export type PreparedVideosStatisticsParams = z.infer<typeof PreparedVideosStatisticsParamsSchema>;
export type PreparedVideosStatisticsResponse = Record<string, number>;

export type HasPreparedVideoBeenCreatedParams = z.infer<
    typeof HasPreparedVideoBeenCreatedParamsSchema
>;
export type HasPreparedVideoBeenCreatedResponse = z.infer<
    typeof HasPreparedVideoBeenCreatedResponseSchema
>;
