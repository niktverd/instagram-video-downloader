import {Router as expressRouter} from 'express';

import chorRoutes from './sections/chore/routes';
import cloudRunRoutes from './sections/cloud-run/routes';
import instagramRoutes from './sections/instagram/routes';
import pubsubRoutes from './sections/pubsub/routes';
import uiRoutes from './sections/ui/routes';
import userRoutes from './sections/users/routes';
import youtubeRoutes from './sections/youtube/routes';

const router = expressRouter();

// Use route modules
router.use('/ui', uiRoutes);
router.use('/cloud-run', cloudRunRoutes);
router.use('/pubsub', pubsubRoutes);
router.use('/instagram', instagramRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/users', userRoutes);
router.use('/', chorRoutes);

export default router;
