import {Router as expressRouter} from 'express';

import {createVideo} from './controllers/reels-creator';
import {runScenarioPost} from './controllers/run-scenario';

const router = expressRouter();

// Cloud Run routes
router.post('/reels-creator', createVideo);
router.post('/run-scenario', runScenarioPost);

export default router;
