import {Router as expressRouter} from 'express';

import {pingPong} from './controllers';

const router = expressRouter();

// GET routes
router.get('/ping', pingPong);

export default router;
