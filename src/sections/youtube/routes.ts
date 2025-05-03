import {Router as expressRouter} from 'express';

import {youtubeAuth, youtubeAuthCallback} from './controllers';

const router = expressRouter();

// GET routes
router.get('/auth', youtubeAuth);
router.get('/oauth2-callback', youtubeAuthCallback);

export default router;
