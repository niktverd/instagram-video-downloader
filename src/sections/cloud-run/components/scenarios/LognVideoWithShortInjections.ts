// import {rmSync} from 'fs';
// import {join} from 'path';

// import {updateDoc} from 'firebase/firestore/lite';
// import {shuffle} from 'lodash';

// import {
//     addSilentAudioStream,
//     checkHasAudio,
//     concatVideoFromList,
//     normalizeVideo,
//     saveFileList,
//     trimVideo,
// } from '../video';

// import {ScenarioV4, SourceV3} from '#types';
// import {getWorkingDirectoryForVideo, log, prepareCaption, saveFileToDisk} from '#utils';
// import {
//     addPreparedVideo,
//     getAccounts,
//     getNRandomSources,
//     getScenarios,
//     uploadFileToServer,
// } from '$/shared';
// import { ScenarioType } from '#schemas/scenario';

// type PrepareLongVideoWithShortInjectionsArgs = {
//     scenario: ScenarioV4;
//     accounts: string[];
// };

// export const prepareLongVideoWithShortInjections = async ({
//     scenario,
//     accounts,
// }: PrepareLongVideoWithShortInjectionsArgs) => {
//     if (scenario.type !== ScenarioType.ScenarioLongVideoWithInjections) {
//         log(
//             'scenario.type error',
//             scenario.type,
//             'expect to be',
//             'ScenarioLongVideoWithInjections',
//         );
//         return;
//     }
//     const directoryName = `prepareLongVideoWithShortInjections-${Math.random()}`;

//     const basePath = getWorkingDirectoryForVideo(directoryName);

//     const {limit, startBannerUrl, injections, adsBannerUrl, name} = scenario;
//     const injectionUrls = [...shuffle(injections).slice(0, limit - 1), adsBannerUrl];

//     log({injectionUrls});
//     const {videoUrls, sourceRefs, ids, originalHashtags} = await getNRandomSources(limit);
//     log({videoUrls});
//     const urls = [startBannerUrl];

//     for (let i = 0; i < limit; i++) {
//         urls.push(videoUrls[i]);
//         urls.push(injectionUrls[i]);
//     }

//     log({urls});

//     const fileNames: string[] = [];
//     let indx = 0;
//     for (const url of urls) {
//         let tempFilePath = join(basePath, `input-${indx++}.mp4`);
//         await saveFileToDisk(url, tempFilePath);
//         const hasAudio = await checkHasAudio(tempFilePath);
//         if (!hasAudio) {
//             tempFilePath = await addSilentAudioStream({input: tempFilePath});
//         }
//         if (indx % 2 === 0) {
//             tempFilePath = await trimVideo({input: tempFilePath, maxDuration: 7});
//         }
//         const tempFilePathFormated = await normalizeVideo(tempFilePath);
//         fileNames.push(tempFilePathFormated);
//     }

//     // concat videos
//     const outputListPath = join(basePath, 'outputList.txt');
//     const outputFilePath = join(basePath, 'output.mp4');
//     saveFileList(outputListPath, ...fileNames);
//     await concatVideoFromList(outputListPath, outputFilePath);

//     // Upload data to server
//     const downloadURL = await uploadFileToServer(outputFilePath, `${directoryName}-${name}.mp4`);

//     // update database
//     await addPreparedVideo({
//         firebaseUrl: downloadURL,
//         scenarioName: name,
//         scenarioId: scenario.id,
//         sourceId: ids.join('_'),
//         title: prepareCaption(scenario),
//         originalHashtags: shuffle(originalHashtags).slice(0, 10),
//         accounts,
//         accountsHasBeenUsed: [],
//     });

//     // delete tempfiles
//     rmSync(basePath, {recursive: true});

//     for (const snapRef of sourceRefs) {
//         await updateDoc(snapRef.ref, {timesUsed: snapRef.timesUsed + 1} as Partial<SourceV3>);
//     }
// };

// export const runInjectionScenraios = async () => {
//     const accounts = await getAccounts(true);
//     const scenarios = await getScenarios(true);

//     for (const scenario of scenarios) {
//         log({scenario});
//         await prepareLongVideoWithShortInjections({
//             scenario,
//             accounts: accounts
//                 .filter((acc) => acc.availableScenarios?.includes(scenario.name))
//                 .map((acc) => acc.id),
//         });
//     }
// };
