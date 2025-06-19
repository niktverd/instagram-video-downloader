import {
    convertImageToVideo,
    getAllMediaPosts,
    splitVideoInTheMiddle,
    testGreenScreen,
} from '../components/mediaPosts';

import {wrapper} from '#src/db/utils';
import {
    ConvertImageToVideoParamsSchema,
    GetAllMediaPostsParamsSchema,
    SplitVideoInTheMiddleParamsSchema,
    TestGreenScreenParamsSchema,
} from '#src/types/schemas/handlers/uiCommon';
import {
    ConvertImageToVideoParams,
    ConvertImageToVideoResponse,
    GetAllMediaPostsParams,
    GetAllMediaPostsResponse,
    SplitVideoInTheMiddleParams,
    SplitVideoInTheMiddleResponse,
    TestGreenScreenParams,
    TestGreenScreenResponse,
} from '#src/types/uiCommon';

export const uiGetMediaPostsGet = wrapper<GetAllMediaPostsParams, GetAllMediaPostsResponse>(
    getAllMediaPosts,
    GetAllMediaPostsParamsSchema,
    'GET',
);

// export const uiSplitVideoInTheMiddle = async (req: Request, res: Response) => {
//     try {
//         const {id} = req.body;
//         if (!id) {
//             throw new ThrownError('id was not provided', 400);
//         }

//         const collectionRef = collection(firestore, Collection.MediaPosts);
//         const docRef = doc(collectionRef, id);
//         const snap = await getDoc(docRef);
//         if (!snap.exists()) {
//             throw new ThrownError(`Document with id ${id} does not exist`, 400);
//         }
//         const data = snap.data() as MediaPostModel;

//         log({data});
//         res.status(200).send({
//             status: 'ok',
//         });

//         await splitVideoInTheMiddle(data, snap.id);
//     } catch (error) {
//         logError(error);
//         res.status(500).send(error);
//     }
// };
export const uiSplitVideoInTheMiddlePost = wrapper<
    SplitVideoInTheMiddleParams,
    SplitVideoInTheMiddleResponse
>(splitVideoInTheMiddle, SplitVideoInTheMiddleParamsSchema, 'POST');

// export const uiTestGreenScreen = async (req: Request, res: Response) => {
//     try {
//         const {id} = req.body;
//         if (!id) {
//             throw new ThrownError('id was not provided', 400);
//         }

//         const collectionRef = collection(firestore, Collection.MediaPosts);
//         const docRef = doc(collectionRef, id);
//         const snap = await getDoc(docRef);
//         if (!snap.exists()) {
//             throw new ThrownError(`Document with id ${id} does not exist`, 400);
//         }
//         const data = snap.data() as MediaPostModel;

//         log({data});
//         res.status(200).send({
//             status: 'ok',
//         });

//         await testPIP(data, snap.id);
//     } catch (error) {
//         log(error);
//         res.status(500).send(error);
//     }
// };

// export const uiDownloadVideoFromSourceV3 = async (_req: Request, res: Response) => {
//     res.status(200).send({message: 'uiDownloadVideoFromSourceV3 started'});
//     downloadVideoCron(DelayMS.Sec1, true);
// };

export const uiTestGreenScreenPost = wrapper<TestGreenScreenParams, TestGreenScreenResponse>(
    testGreenScreen,
    TestGreenScreenParamsSchema,
    'POST',
);

// export const uiConvertImageToVideo = async (req: Request, res: Response) => {
//     const {imageUrl, duration, pathToSave = ''} = req.body;
//     if (!imageUrl || !duration) {
//         res.status(400).send({message: 'if (!imageUrl || !duration) {'});
//         return;
//     }
//     if (!imageUrl.includes('.jpeg') && !imageUrl.includes('.jpg') && !imageUrl.includes('.png')) {
//         res.status(400).send({message: 'not image'});
//         return;
//     }

//     const randomName = Math.random().toString();
//     const basePath = getWorkingDirectoryForVideo(randomName);

//     //download videos
//     const temp1 = join(basePath, `frame.img`);

//     const imagePath = await saveFileToDisk(imageUrl, temp1);

//     const videoFile = await createVideoOfFrame({input: imagePath, duration});
//     const withAudio = await addSilentAudioStream({input: videoFile});
//     const normalized = await normalizeVideo(withAudio);
//     console.log({normalized});
//     const downloadURL = await uploadFileToServer(normalized, `${pathToSave}${randomName}.mp4`);

//     // delete tempfiles
//     rmSync(basePath, {recursive: true});

//     res.status(200).send({path: downloadURL});
// };
export const uiConvertImageToVideoPost = wrapper<
    ConvertImageToVideoParams,
    ConvertImageToVideoResponse
>(convertImageToVideo, ConvertImageToVideoParamsSchema, 'POST');
