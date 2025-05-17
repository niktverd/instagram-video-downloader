import {Router as expressRouter} from 'express';

import {clearPreprod} from '../shared';

import {
    createAccountPost,
    createInstagramMediaContainerPost,
    createScenarioPost,
    createSourcePost,
    createUserPost,
    deleteAccountDelete,
    deleteInstagramMediaContainerDelete,
    deleteScenarioDelete,
    deleteSourceDelete,
    deleteUserDelete,
    getAccountByIdGet,
    getAccountBySlugGet,
    getAllAccountsGet,
    getAllInstagramMediaContainersGet,
    getAllPreparedVideosGet,
    getAllScenariosGet,
    getAllSourcesGet,
    getAllUsersGet,
    getOneSourceGet,
    getUserByEmailGet,
    getUserByIdGet,
    uiConvertImageToVideo,
    uiCreateVideoByScenario,
    uiDownloadVideoFromSourceV3,
    uiGetInsights,
    uiGetInstagramMedia,
    uiGetInstagramUserIdByMediaId,
    uiGetMediaPosts,
    uiGetUserContent,
    uiSavePostForFutherAnalysis,
    uiSplitVideoInTheMiddle,
    uiTestGreenScreen,
    updateAccountPatch,
    updateInstagramMediaContainerPatch,
    updateScenarioPatch,
    updateSourcePatch,
    updateUserPatch,
} from './controllers';

const router = expressRouter();

// GET routes
router.get('/get-media-posts', uiGetMediaPosts);
router.get('/get-scenarios', getAllScenariosGet);
router.get('/get-accounts', getAllAccountsGet);
router.get('/get-account-by-id', getAccountByIdGet);
router.get('/get-account-by-slug', getAccountBySlugGet);
router.get('/create-video-by-scenario', uiCreateVideoByScenario);
router.get('/download-video-from-source-v3', uiDownloadVideoFromSourceV3);
router.get('/get-insights', uiGetInsights);
router.get('/get-media', uiGetInstagramMedia);
// router.get('/get-user-by-id', uiGetInstagramUserById);
router.get('/get-owner-by-media-id', uiGetInstagramUserIdByMediaId);
router.get('/get-user-content', uiGetUserContent);
router.get('/get-user-by-id', getUserByIdGet);
router.get('/get-user-by-email', getUserByEmailGet);
router.get('/get-all-users', getAllUsersGet);
router.get('/get-all-sources', getAllSourcesGet);
router.get('/get-one-source', getOneSourceGet);
router.get('/get-all-instagram-media-containers', getAllInstagramMediaContainersGet);
router.get('/get-all-prepared-videos', getAllPreparedVideosGet);

// POST routes
router.post('/split-video-in-the-middle', uiSplitVideoInTheMiddle);
router.post('/test-green-screen', uiTestGreenScreen);
router.post('/add-scenario', createScenarioPost);
router.post('/add-account', createAccountPost);
router.post('/convert-image-to-video', uiConvertImageToVideo);
router.post('/save-post-for-futher-analysis', uiSavePostForFutherAnalysis);
router.post('/create-user', createUserPost);
router.post('/create-source', createSourcePost);
router.post('/create-instagram-media-container', createInstagramMediaContainerPost);

// PATCH routes
router.patch('/patch-scenario', updateScenarioPatch);
router.patch('/patch-account', updateAccountPatch);
router.patch('/update-user', updateUserPatch);
router.patch('/update-source', updateSourcePatch);
router.patch('/update-instagram-media-container', updateInstagramMediaContainerPatch);

// DELETE routes
router.delete('/clear-proprod-database', clearPreprod);
router.delete('/delete-user', deleteUserDelete);
router.delete('/delete-account', deleteAccountDelete);
router.delete('/delete-scenario', deleteScenarioDelete);
router.delete('/delete-source', deleteSourceDelete);
router.delete('/delete-instagram-media-container', deleteInstagramMediaContainerDelete);

export default router;
