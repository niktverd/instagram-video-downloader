import {Router as expressRouter} from 'express';

import {clearPreprod} from '../shared';

import {
    uiAddAccount,
    uiAddScenario,
    uiConvertImageToVideo,
    uiCreateVideoByScenario,
    uiDownloadVideoFromSourceV3,
    uiGetAccounts,
    uiGetInsights,
    uiGetInstagramMedia,
    uiGetInstagramUserById,
    uiGetInstagramUserIdByMediaId,
    uiGetMediaPosts,
    uiGetScenarios,
    uiGetUserContent,
    uiPatchAccount,
    uiPatchScenario,
    uiRunInjectionScenraios,
    uiSavePostForFutherAnalysis,
    uiSplitVideoInTheMiddle,
    uiTestGreenScreen,
} from './controllers';

const router = expressRouter();

// GET routes
router.get('/get-media-posts', uiGetMediaPosts);
router.get('/get-scenarios', uiGetScenarios);
router.get('/get-accounts', uiGetAccounts);
router.get('/create-video-by-scenario', uiCreateVideoByScenario);
router.get('/download-video-from-source-v3', uiDownloadVideoFromSourceV3);
router.get('/get-insights', uiGetInsights);
router.get('/get-media', uiGetInstagramMedia);
router.get('/get-user-by-id', uiGetInstagramUserById);
router.get('/get-owner-by-media-id', uiGetInstagramUserIdByMediaId);
router.get('/run-injection-scenarios', uiRunInjectionScenraios);
router.get('/get-user-content', uiGetUserContent);

// POST routes
router.post('/split-video-in-the-middle', uiSplitVideoInTheMiddle);
router.post('/test-green-screen', uiTestGreenScreen);
router.post('/add-scenario', uiAddScenario);
router.post('/add-account', uiAddAccount);
router.post('/convert-image-to-video', uiConvertImageToVideo);
router.post('/save-post-for-futher-analysis', uiSavePostForFutherAnalysis);

// PATCH routes
router.patch('/patch-scenario', uiPatchScenario);
router.patch('/patch-account', uiPatchAccount);

// DELETE routes
router.delete('/clear-proprod-database', clearPreprod);

export default router;
