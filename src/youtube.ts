import {createReadStream} from 'fs';

import dotenv from 'dotenv';
import {google} from 'googleapis';

dotenv.config();
const OAuth2 = google.auth.OAuth2;

export const uploadYoutubeVideo = async () => {
    const oauth2Client = new OAuth2(
        process.env.YT_CLOUD_ID,
        process.env.YT_SECRET_ID,
        process.env.YT_REDIRECT_URL,
    );

    oauth2Client.setCredentials({refresh_token: process.env.YT_REFRESH_TOKEN});
    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
    });

    youtube.videos.insert(
        {
            requestBody: {
                snippet: {
                    title: 'test title',
                    description: 'test description',
                },
                status: {
                    privacyStatus: 'private',
                },
            },
            part: ['snippet', 'status'],
            media: {
                body: createReadStream(
                    '/Users/niktverd/code/instagram-video-downloader/assets/0NIlzYcCyknw8Krie2h7.mp4',
                ),
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: Error | null, data: any) => {
            if (err) {
                console.error(err);
            } else {
                console.log('video published', data.data.id);
            }
        },
    );
};
