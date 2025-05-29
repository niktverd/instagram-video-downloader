import {Router as expressRouter} from 'express';

import {
    callbackInstagramLogin,
    getInsightsInstagramSchedule,
    hubChallangeWebhook,
    instagramLogin,
    messageWebhookV3Post,
    publishById,
    publishIntagramV4Post,
    publishVideoFromUrl,
    removePublishedFromFirebase,
} from './controllers';

const router = expressRouter();

// GET routes
router.get('/webhooks', hubChallangeWebhook);
router.get('/publish', publishIntagramV4Post);
router.get('/remove-published', removePublishedFromFirebase);
router.get('/login', instagramLogin);
router.get('/callback', callbackInstagramLogin);
router.get('/get-insights-schedule', getInsightsInstagramSchedule);

// POST routes
router.post('/webhooks', messageWebhookV3Post);
router.post('/publish-by-id', publishById);
router.post('/publish-video-from-url', publishVideoFromUrl);

export default router;
