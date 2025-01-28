import path from 'path';

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
import {youtubeAuth, youtubeAuthCallback} from './src/controllers/youtube';
import {preprocessVideo} from './src/preprocess-video';
import {renderApp} from './src/react-client';

dotenv.config();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.set('query parser', function (str: string) {
    return qs.parse(str, {
        /* custom options */
    });
});

// app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/webhooks', hubChallangeWebhook);
app.get('/report', reportInterface);
app.get('/publish', publishIntagram2);
app.get('/remove-published', removePublishedFromFirebase);
app.get('/yt-auth', youtubeAuth);
app.get('/yt-oauth2-callback', youtubeAuthCallback);
app.get('/react', (_req, res) => {
    const reactApp = renderApp(); // Рендерим React-компонент в строку
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>React SSR</title>
        </head>
        <body>
            <div id="root">${reactApp}</div>
            <script src="/bundle.js"></script> <!-- Подключение клиентского JS -->
        </body>
        </html>
    `);
});

app.post('/webhooks', messageWebhook);
app.post('/remove-post-by-id', removePostById);
app.post('/publish-by-id', publishById);

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    console.log(`Example app listening on port ${appPort}`);
});

preprocessVideo(DelayMS.Sec30);
