// import {rmSync} from 'fs';
// import {join} from 'path';

// import {getVideoDuration, normalizeVideo, overlayImageOnVideo} from '../video';

// import {ScenarioFunction} from './types';

// import {ScenarioType} from '#src/schemas/scenario';
// import {ScenarioAddBannerAtTheEndUnique, ScenarioCoverWithImasge} from '#types';
// import {getWorkingDirectoryForVideo, log, prepareCaption, saveFileToDisk} from '#utils';
// import {addPreparedVideo, uploadFileToServer} from '$/shared';

// export const coverWithImage: ScenarioFunction = async ({source, scenario, basePath}) => {
//     const {
//         options: {extraBannerUrl},
//     } = scenario as ScenarioCoverWithImasge;

//     if (!accounts.length || !scenario) {
//         throw new Error('Accounts cannot be empty');
//     }

//     if (scenario.type !== ScenarioType.ScenarioCoverWithImage) {
//         log(
//             'scenario.type error',
//             scenario.type,
//             'expect to be',
//             'ScenarioLongVideoWithInjections',
//         );
//         return;
//     }

//     const {
//         name: scenarioName,
//         id: scenarioId,
//         imageUrl,
//         imageHeight,
//         imageLeft,
//         imageTop,
//         imageWidth,
//     } = scenario;

//     log({mainVideoUrl});
//     const basePath = getWorkingDirectoryForVideo(directoryName);

//     //download videos
//     const tempFilePath1 = join(basePath, 'first.mp4');
//     const tempFilePath2 = join(basePath, 'second.png');
//     await Promise.all([
//         saveFileToDisk(mainVideoUrl, tempFilePath1),
//         saveFileToDisk(imageUrl, tempFilePath2),
//     ]);

//     const tempFileCovered = await overlayImageOnVideo({
//         input: tempFilePath1,
//         overlayImage: tempFilePath2,
//         top: imageTop,
//         left: imageLeft,
//         width: imageWidth,
//         height: imageHeight,
//     });

//     const outputFilePath = await normalizeVideo(tempFileCovered);

//     // Upload data to server
//     const downloadURL = await uploadFileToServer(
//         outputFilePath,
//         `${directoryName}-${scenarioName}.mp4`,
//     );

//     log('\n\n\n', {downloadURL});

//     // update database
//     await addPreparedVideo({
//         firebaseUrl: downloadURL,
//         scenarioName,
//         scenarioId,
//         sourceId,
//         title: prepareCaption(scenario),
//         originalHashtags,
//         accounts,
//         accountsHasBeenUsed: [],
//         parameters: {
//             scenario,
//             mainVideoUrl,
//             sourceId,
//             duration: await getVideoDuration(outputFilePath),
//         },
//     });

//     // delete tempfiles
//     rmSync(basePath, {recursive: true});
// };
