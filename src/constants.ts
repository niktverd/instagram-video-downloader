import dotenv from 'dotenv';

dotenv.config();

export enum Collection {
    MediaPosts = 'media-posts',
    System = 'system',
}

export enum DelayMS {
    Sec1 = 1000,
    Min5 = 5 * 60 * 1000,
}

export enum DelayS {
    Min5 = 5 * 60,
    Min10 = 10 * 60,
    Day2 = 48 * 60 * 60,
}

export const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]');
