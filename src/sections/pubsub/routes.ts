import {Router as expressRouter} from 'express';

import {publishBulkRunScenarioMessagesByIdsPost, pushPubSubTestPost} from './controllers';

const router = expressRouter();

// GET routes
router.get('/push-test', pushPubSubTestPost);

// POST routes
router.post('/shedule-source-video-creation', publishBulkRunScenarioMessagesByIdsPost);

export default router;
