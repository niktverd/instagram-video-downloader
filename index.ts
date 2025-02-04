import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import qs from 'qs';

import {DelayMS} from './src/constants';
import {removePostById, reportInterface} from './src/controllers/ejs';
import {hubChallangeWebhook, messageWebhook} from './src/controllers/instagram-webhooks';
import {
    publishById,
    publishIntagram2,
    removePublishedFromFirebase,
} from './src/controllers/publishing';
import {uiGetMediaPosts, uiSplitVideoInTheMiddle, uiTestGreenScreen} from './src/controllers/ui';
import {youtubeAuth, youtubeAuthCallback} from './src/controllers/youtube';
import {preprocessVideo} from './src/preprocess-video';

dotenv.config();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(
    cors({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        origin: function (origin: any, callback: any) {
            const allowedOrigins = [
                'http://localhost:3000',
                'https://insta-analytics-and-scheduler-07bfbcb85994.herokuapp.com',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                // eslint-disable-next-line callback-return
                callback(null, true);
            } else {
                // eslint-disable-next-line callback-return
                callback(new Error('Not allowed by CORS'));
            }
        },
    }),
);
app.set('query parser', function (str: string) {
    return qs.parse(str, {
        /* custom options */
    });
});

app.set('view engine', 'ejs');

app.get('/webhooks', hubChallangeWebhook);
app.get('/report', reportInterface);
app.get('/publish', publishIntagram2);
app.get('/remove-published', removePublishedFromFirebase);
app.get('/yt-auth', youtubeAuth);
app.get('/yt-oauth2-callback', youtubeAuthCallback);
app.get('/ui-get-media-posts', uiGetMediaPosts);

app.post('/webhooks', messageWebhook);
app.post('/remove-post-by-id', removePostById);
app.post('/publish-by-id', publishById);
app.post('/ui-split-video-in-the-middle', uiSplitVideoInTheMiddle);
app.post('/ui-test-green-screen', uiTestGreenScreen);

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    console.log(`Example app listening on port ${appPort}`);
});

preprocessVideo(DelayMS.Sec30);
