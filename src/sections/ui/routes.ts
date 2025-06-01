import {Router as expressRouter} from 'express';

import {
    createAccountPost,
    createInstagramLocationPost,
    createInstagramMediaContainerPost,
    createPreparedVideoPost,
    createScenarioPost,
    createSourcePost,
    createUserPost,
    deleteAccountDelete,
    deleteInstagramLocationDelete,
    deleteInstagramMediaContainerDelete,
    deletePreparedVideoDelete,
    deleteScenarioDelete,
    deleteSourceDelete,
    deleteUserDelete,
    findPreparedVideoDuplicatesGet,
    getAccountByIdGet,
    getAccountBySlugGet,
    getAllAccountsGet,
    getAllCommentsForPostsGet,
    getAllInstagramLocationsGet,
    getAllInstagramMediaContainersGet,
    getAllPreparedVideosGet,
    getAllScenariosGet,
    getAllSourcesGet,
    getAllUsersGet,
    getInstagramAccountInsightsGet,
    getInstagramMediaContainerByIdGet,
    getInstagramMediaContainersStatisticsByDaysGet,
    getOneSourceGet,
    getPreparedVideoByIdGet,
    getPreparedVideosStatisticsByDaysGet,
    getScenarioByIdGet,
    getSourcesStatisticsByDaysGet,
    getUserByEmailGet,
    getUserByIdGet,
    hasPreparedVideoBeenCreatedGet,
    uiConvertImageToVideoPost,
    uiGetInsightsGet,
    uiGetInstagramMediaGet,
    uiGetInstagramUserIdByMediaIdGet,
    uiGetMediaPostsGet,
    uiGetUserContentGet,
    uiSplitVideoInTheMiddlePost,
    uiTestGreenScreenPost,
    updateAccountPatch,
    updateInstagramLocationPatch,
    updateInstagramMediaContainerPatch,
    updatePreparedVideoPatch,
    updateScenarioPatch,
    updateSourcePatch,
    updateUserPatch,
} from './controllers';

const router = expressRouter();

// GET routes
router.get('/get-media-posts', uiGetMediaPostsGet);
router.get('/get-scenarios', getAllScenariosGet);
router.get('/get-scenario-by-id', getScenarioByIdGet);
router.get('/get-accounts', getAllAccountsGet);
router.get('/get-account-by-id', getAccountByIdGet);
router.get('/get-account-by-slug', getAccountBySlugGet);
// router.get('/download-video-from-source-v3', uiDownloadVideoFromSourceV3);
router.get('/get-insights', uiGetInsightsGet);
router.get('/get-media', uiGetInstagramMediaGet);
// router.get('/get-user-by-id', uiGetInstagramUserById);
router.get('/get-owner-by-media-id', uiGetInstagramUserIdByMediaIdGet);
router.get('/get-user-content', uiGetUserContentGet);
router.get('/get-user-by-id', getUserByIdGet);
router.get('/get-user-by-email', getUserByEmailGet);
router.get('/get-all-users', getAllUsersGet);
router.get('/get-all-sources', getAllSourcesGet);
router.get('/get-one-source', getOneSourceGet);
router.get('/get-all-instagram-media-containers', getAllInstagramMediaContainersGet);
router.get('/get-instagram-media-container-by-id', getInstagramMediaContainerByIdGet);
router.get('/get-all-prepared-videos', getAllPreparedVideosGet);
router.get('/get-all-instagram-locations', getAllInstagramLocationsGet);
// router.get('/get-instagram-location-by-id', getInstagramLocationByIdGet);
router.get('/get-instagram-account-insights', getInstagramAccountInsightsGet);
router.get('/get-all-comments-for-posts', getAllCommentsForPostsGet);
router.get('/get-prepared-video-by-id', getPreparedVideoByIdGet);
router.get('/get-prepared-video-duplicates', findPreparedVideoDuplicatesGet);
router.get('/get-sources-statistics-by-days', getSourcesStatisticsByDaysGet);
router.get('/get-prepared-videos-statistics-by-days', getPreparedVideosStatisticsByDaysGet);
router.get(
    '/get-instagram-media-containers-statistics-by-days',
    getInstagramMediaContainersStatisticsByDaysGet,
);
router.get('/has-prepared-video-been-created', hasPreparedVideoBeenCreatedGet);

// POST routes
router.post('/split-video-in-the-middle', uiSplitVideoInTheMiddlePost);
router.post('/test-green-screen', uiTestGreenScreenPost);
router.post('/add-scenario', createScenarioPost);
router.post('/add-account', createAccountPost);
router.post('/convert-image-to-video', uiConvertImageToVideoPost);
router.post('/create-user', createUserPost);
router.post('/create-source', createSourcePost);
router.post('/create-instagram-media-container', createInstagramMediaContainerPost);
router.post('/create-instagram-location', createInstagramLocationPost);
router.post('/add-prepared-video', createPreparedVideoPost);

// PATCH routes
router.patch('/patch-scenario', updateScenarioPatch);
router.patch('/patch-account', updateAccountPatch);
router.patch('/update-user', updateUserPatch);
router.patch('/update-source', updateSourcePatch);
router.patch('/update-instagram-media-container', updateInstagramMediaContainerPatch);
router.patch('/update-instagram-location', updateInstagramLocationPatch);
router.patch('/patch-prepared-video', updatePreparedVideoPatch);

// DELETE routes
router.delete('/delete-user', deleteUserDelete);
router.delete('/delete-account', deleteAccountDelete);
router.delete('/delete-scenario', deleteScenarioDelete);
router.delete('/delete-source', deleteSourceDelete);
router.delete('/delete-instagram-media-container', deleteInstagramMediaContainerDelete);
router.delete('/delete-instagram-location', deleteInstagramLocationDelete);
router.delete('/delete-prepared-video', deletePreparedVideoDelete);

export default router;
