import dotenv from 'dotenv';

dotenv.config();

export enum Collection {
    MediaPosts = 'media-posts',
    System = 'system',

    // v3
    Sources = 'sources',
    Scenarios = 'scenarios',
}

export enum DelayMS {
    Sec1 = 1000,
    Sec30 = 30 * 1000,
    Min5 = 5 * 60 * 1000,
}

export enum DelayS {
    Min5 = 5 * 60,
    Min10 = 10 * 60,
    Day2 = 48 * 60 * 60,
}

export enum MediaPostModelFilters {
    CreatedAt = 'createdAt',
    RandomIndex = 'randomIndex',
}

export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]');

export const SECOND_VIDEO =
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2F0116.mp4?alt=media&token=60b0b84c-cd07-4504-9a6f-a6a44ea73ec4';
