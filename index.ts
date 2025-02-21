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
import {log, logError} from './src/utils';

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

// https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1537015991021174&redirect_uri=https://instagram-video-downloader-e0875c65c071.herokuapp.com/callback-instagram&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights

// const DEFAULT_GRAPH_API_ORIGIN = 'https://api.instagram.com/oauth/authorize';
// const DEFAULT_GRAPH_API_VERSION = '';
const REDIRECT_URI =
    'https://instagram-video-downloader-e0875c65c071.herokuapp.com/callback-instagram';
const REDIRECT_URI_TOKEN =
    'https://instagram-video-downloader-e0875c65c071.herokuapp.com/token-instagram';

const {APP_ID, API_SECRET} = process.env;

const SCOPES = [
    // 'user_profile',
    // 'user_media',
    // 'instagram_basic',
    // 'instagram_business_basic',
    // 'instagram_content_publish',
    // 'instagram_business_content_publish',
    // 'instagram_business_manage_comments',
    // 'instagram_business_manage_messages',
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
];
const STRINGIFIED_SCOPES = SCOPES.join('%2c');

const getLongLivedToken = async (shortLivedToken: string) => {
    try {
        const response = await fetch(
            `https://graph.instagram.com/access_token
                ?grant_type=ig_exchange_token
                &client_secret=${API_SECRET}
                &access_token=${shortLivedToken}
            `.replace(/\s+/g, ''),
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            },
        );

        log(response);

        const responseJson = await response.json();

        log('Long-lived Token:', responseJson);
        return responseJson.access_token;
    } catch (error) {
        logError('Error getting long-lived token:', error);
        console.log(error);
        return null;
    }
};

// Login route using FB OAuth
app.get('/login', (_req: Request, res: Response) => {
    const authUrl = `https://api.instagram.com/oauth/authorize
      ?client_id=${APP_ID}
      &redirect_uri=${REDIRECT_URI}
      &scope=${STRINGIFIED_SCOPES}
      &response_type=code`.replace(/\s+/g, ''); // Убираем пробелы

    res.redirect(authUrl);
});

// Callback route for handling FB OAuth user token And reroute to '/pages'
app.get('/callback-instagram', async function (req: Request, res: Response) {
    const code = req.query.code;
    if (!code) {
        res.status(400).send('Authorization failed');
        return;
    }

    log({
        client_id: APP_ID || '',
        redirect_uri: REDIRECT_URI_TOKEN || '',
        client_secret: API_SECRET || '',
        code: (code as string) || '',
    });
    const uri = `https://api.instagram.com/oauth/access_token`.replace(/\s+/g, '');
    log({uri});

    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: JSON.stringify({
                client_id: APP_ID,
                client_secret: API_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI_TOKEN,
                code,
            }),
        });
        log(response);
        console.log(response);
        const responseJson = await response.json();
        log(responseJson);
        const {access_token: accessToken, user_id: userId} = responseJson;
        const longLivedToken = await getLongLivedToken(accessToken);

        res.send(JSON.stringify({responseJson, longLivedToken, userId, accessToken}));
    } catch (err) {
        log({err});
        console.log(err);
        res.send(JSON.stringify(err));
    }
});
app.get('/token-instagram', async function (req: Request, res: Response) {
    const query = req.query;
    const body = req.body;
    res.send({query, body});
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    log(`Example app listening on port ${appPort}`);
});

downloadVideoCron(DelayMS.Sec30);
runScenarioCron(DelayMS.Sec30);
