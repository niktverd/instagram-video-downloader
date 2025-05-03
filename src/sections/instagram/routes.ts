import {Router as expressRouter} from 'express';

import {
    callbackInstagramLogin,
    getInsightsInstagramSchedule,
    hubChallangeWebhook,
    instagramLogin,
    messageWebhookV3,
    publishById,
    publishIntagramV3,
    publishVideoFromUrl,
    removePublishedFromFirebase,
} from './controllers';

const router = expressRouter();

// GET routes
router.get('/webhooks', hubChallangeWebhook);
router.get('/publish', publishIntagramV3);
router.get('/remove-published', removePublishedFromFirebase);
router.get('/login', instagramLogin);
router.get('/callback', callbackInstagramLogin);
router.get('/get-insights-schedule', getInsightsInstagramSchedule);

// POST routes
router.post('/webhooks', messageWebhookV3);
router.post('/publish-by-id', publishById);
router.post('/publish-video-from-url', publishVideoFromUrl);

export default router;
