import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import 'module-alias/register';
import qs from 'qs';

import appRoutes from './src/routes';

import {
    callbackInstagramLogin,
    hubChallangeWebhook,
    messageWebhookV3Post,
} from '$/instagram/controllers';

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

// Use the reorganized routes
app.use('/api', appRoutes);

// instagram handlers
// leave it here, because they are configured in the instagram app
app.get('/webhooks', hubChallangeWebhook);
app.post('/webhooks', messageWebhookV3Post);
app.get('/webhooks2', hubChallangeWebhook);
app.post('/webhooks2', messageWebhookV3Post);
app.get('/callback-instagram', callbackInstagramLogin);

export default app;
