import {Router as expressRouter} from 'express';

import {createVideo} from './controllers/reels-creator';

const router = expressRouter();

// Cloud Run routes
router.post('/reels-creator', createVideo);

export default router;
