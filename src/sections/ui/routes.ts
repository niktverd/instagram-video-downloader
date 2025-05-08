import {Router as expressRouter} from 'express';

import {clearPreprod} from '../shared';

import {
    createAccountPost,
    createScenarioPost,
    createSourcePost,
    createUserPost,
    deleteAccountDelete,
    deleteScenarioDelete,
    deleteSourceDelete,
    deleteUserDelete,
    getAccountByIdGet,
    getAccountBySlugGet,
    getAllAccountsGet,
    getAllScenariosGet,
    getAllSourcesGet,
    getAllUsersGet,
    getOneSourceGet,
    getUserByEmailGet,
    getUserByIdGet,
    // uiAddAccount,
    // uiAddScenario,
    uiConvertImageToVideo,
    uiCreateVideoByScenario,
    uiDownloadVideoFromSourceV3,
    // uiGetAccounts,
    uiGetInsights,
    uiGetInstagramMedia,
    // uiGetInstagramUserById,
    uiGetInstagramUserIdByMediaId,
    uiGetMediaPosts,
    // uiGetScenarios,
    uiGetUserContent,
    // uiPatchAccount,
    // uiPatchScenario,
    // uiRunInjectionScenraios,
    uiSavePostForFutherAnalysis,
    uiSplitVideoInTheMiddle,
    uiTestGreenScreen,
    updateAccountPatch,
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

// POST routes
router.post('/split-video-in-the-middle', uiSplitVideoInTheMiddle);
router.post('/test-green-screen', uiTestGreenScreen);
router.post('/add-scenario', createScenarioPost);
router.post('/add-account', createAccountPost);
router.post('/convert-image-to-video', uiConvertImageToVideo);
router.post('/save-post-for-futher-analysis', uiSavePostForFutherAnalysis);
router.post('/create-user', createUserPost);
router.post('/create-source', createSourcePost);

// PATCH routes
router.patch('/patch-scenario', updateScenarioPatch);
router.patch('/patch-account', updateAccountPatch);
router.patch('/update-user', updateUserPatch);
router.patch('/update-source', updateSourcePatch);

// DELETE routes
router.delete('/clear-proprod-database', clearPreprod);
router.delete('/delete-user', deleteUserDelete);
router.delete('/delete-account', deleteAccountDelete);
router.delete('/delete-scenario', deleteScenarioDelete);
router.delete('/delete-source', deleteSourceDelete);

export default router;
