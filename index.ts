import cors from 'cors';
import dotenv from 'dotenv';
import express, {Request, Response} from 'express';
import qs from 'qs';

import {DelayMS} from './src/constants';
import {
    hubChallangeWebhook,
    messageWebhookV3,
    publishById,
    publishIntagramV3,
    // removePostById,
    removePublishedFromFirebase,
    // reportInterface,
    uiAddAccount,
    uiAddScenario,
    uiCreateVideoByScenario,
    uiDownloadVideoFromSourceV3,
    uiGetAccounts,
    uiGetInsights,
    uiGetInstagramMedia,
    uiGetInstagramUserById,
    uiGetInstagramUserIdByMediaId,
    uiGetMediaPosts,
    uiGetScenarios,
    uiPatchAccount,
    uiPatchScenario,
    uiRunInjectionScenraios,
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

app.post('/webhooks', messageWebhookV3);
// app.post('/remove-post-by-id', removePostById);
app.post('/publish-by-id', publishById);
app.post('/ui-split-video-in-the-middle', uiSplitVideoInTheMiddle);
app.post('/ui-test-green-screen', uiTestGreenScreen);
app.post('/ui-add-scenario', uiAddScenario);
app.post('/ui-add-account', uiAddAccount);

app.patch('/ui-patch-scenario', uiPatchScenario);
app.patch('/ui-patch-account', uiPatchAccount);

app.delete('/ui-clear-proprod-database', clearPreprod);

const DEFAULT_GRAPH_API_ORIGIN = 'https://api.instagram.com/oauth/authorize';
const DEFAULT_GRAPH_API_VERSION = '';
const REDIRECT_URI =
    'https://instagram-video-downloader-e0875c65c071.herokuapp.com/callback-instagram';

const {APP_ID, API_SECRET, GRAPH_API_ORIGIN, GRAPH_API_VERSION} = process.env;

const GRAPH_API_BASE_URL =
    (GRAPH_API_ORIGIN ?? DEFAULT_GRAPH_API_ORIGIN) +
    '/' +
    (GRAPH_API_VERSION ? GRAPH_API_VERSION + '/' : DEFAULT_GRAPH_API_VERSION);

const SCOPES = [
    // 'user_profile',
    // 'user_media',
    // 'instagram_basic',
    'instagram_business_basic',
    // 'instagram_content_publish',
    // 'instagram_business_content_publish',
    // 'instagram_business_manage_comments',
    // 'instagram_business_manage_messages',
];
const STRINGIFIED_SCOPES = SCOPES.join('%2c');

function buildGraphAPIURL(
    path: string,
    searchParams: Record<string, string>,
    accessToken?: string,
) {
    const url = new URL(path, GRAPH_API_BASE_URL);
    // eslint-disable-next-line no-not-accumulator-reassign/no-not-accumulator-reassign
    Object.keys(searchParams).forEach((key) => !searchParams[key] && delete searchParams[key]);
    url.search = new URLSearchParams(searchParams).toString();
    if (accessToken) url.searchParams.append('access_token', accessToken);

    return url.toString();
}

// Login route using FB OAuth
app.get('/login-instagram', function (_req: Request, res: Response) {
    log({REDIRECT_URI});
    res.redirect(
        `https://api.instagram.com/oauth/authorize?scope=${STRINGIFIED_SCOPES}&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`,
    );
});

// Callback route for handling FB OAuth user token And reroute to '/pages'
app.get('/callback-instagram', async function (req: Request, res: Response) {
    const code = req.query.code;
    log({
        client_id: APP_ID || '',
        redirect_uri: REDIRECT_URI || '',
        client_secret: API_SECRET || '',
        code: (code as string) || '',
    });
    const uri = buildGraphAPIURL('oauth/access_token', {
        client_id: APP_ID || '',
        redirect_uri: REDIRECT_URI || '',
        client_secret: API_SECRET || '',
        code: (code as string) || '',
    });
    log({uri});
    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });
        log(response);
        const responseJson = await response.json();
        log(responseJson);
        res.send(JSON.stringify(responseJson));
    } catch (err) {
        log({err});
        console.log(err);
        res.send(JSON.stringify(err));
    }
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    log(`Example app listening on port ${appPort}`);
});

downloadVideoCron(DelayMS.Sec30);
runScenarioCron(DelayMS.Sec30);
