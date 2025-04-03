import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import qs from 'qs';

import {DelayMS} from './src/constants';
import {
    callbackInstagramLogin,
    getInsightsInstagramSchedule,
    hubChallangeWebhook,
    instagramLogin,
    messageWebhookV3,
    publishById,
    publishIntagramV3,
    // removePostById,
    removePublishedFromFirebase,
    // reportInterface,
    uiAddAccount,
    uiAddScenario,
    uiConvertImageToVideo,
    uiCreateVideoByScenario,
    uiDownloadVideoFromSourceV3,
    uiGetAccounts,
    uiGetInsights,
    uiGetInstagramMedia,
    uiGetInstagramUserById,
    uiGetInstagramUserIdByMediaId,
    uiGetMediaPosts,
    uiGetScenarios,
    uiGetUserContent,
    uiPatchAccount,
    uiPatchScenario,
    uiRunInjectionScenraios,
    uiSavePostForFutherAnalysis,
    uiSplitVideoInTheMiddle,
    uiTestGreenScreen,
    youtubeAuth,
    youtubeAuthCallback,
} from './src/controllers';
import {clearPreprod, downloadVideoCron, runScenarioCron} from './src/logic';
import {log} from './src/utils';

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

// app.set('view engine', 'ejs');

app.get('/webhooks', hubChallangeWebhook);
// app.get('/report', reportInterface);
app.get('/publish', publishIntagramV3);
app.get('/remove-published', removePublishedFromFirebase);
app.get('/yt-auth', youtubeAuth);
app.get('/yt-oauth2-callback', youtubeAuthCallback);
app.get('/ui-get-media-posts', uiGetMediaPosts);
app.get('/ui-get-scenarios', uiGetScenarios);
app.get('/ui-get-accounts', uiGetAccounts);
app.get('/ui-create-video-by-scenario', uiCreateVideoByScenario);
app.get('/ui-download-video-from-source-v3', uiDownloadVideoFromSourceV3);
app.get('/ui-get-insights', uiGetInsights);
app.get('/ui-get-media', uiGetInstagramMedia);
app.get('/ui-get-user-by-id', uiGetInstagramUserById);
app.get('/ui-get-owner-by--media-id', uiGetInstagramUserIdByMediaId);
app.get('/ui-run-injection-scenarios', uiRunInjectionScenraios);
app.get('/ui-get-user-content', uiGetUserContent);
app.get('/login-instagram', instagramLogin);
app.get('/callback-instagram', callbackInstagramLogin);
app.get('/get-insights-instagram-schedule', getInsightsInstagramSchedule);

app.post('/webhooks', messageWebhookV3);
// app.post('/remove-post-by-id', removePostById);
app.post('/publish-by-id', publishById);
app.post('/ui-split-video-in-the-middle', uiSplitVideoInTheMiddle);
app.post('/ui-test-green-screen', uiTestGreenScreen);
app.post('/ui-add-scenario', uiAddScenario);
app.post('/ui-add-account', uiAddAccount);
app.post('/ui-convert-image-to-video', uiConvertImageToVideo);
app.post('/ui-save-post-for-futher-analysis', uiSavePostForFutherAnalysis);

app.patch('/ui-patch-scenario', uiPatchScenario);
app.patch('/ui-patch-account', uiPatchAccount);

app.delete('/ui-clear-proprod-database', clearPreprod);

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    log(`Example app listening on port ${appPort}`);
});

downloadVideoCron(DelayMS.Sec30);
runScenarioCron(DelayMS.Sec30);
