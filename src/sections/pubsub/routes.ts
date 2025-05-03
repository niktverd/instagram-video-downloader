import {Router as expressRouter} from 'express';

import {pubsubHandler, pushMessageToPubSub} from './controllers';

const router = expressRouter();

// GET routes
router.get('/push-test', pushMessageToPubSub);

// POST routes
router.post('/handler', pubsubHandler);

export default router;
