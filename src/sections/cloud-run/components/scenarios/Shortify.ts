import {rmSync} from 'fs';
import {join} from 'path';

import {
    addPreparedVideo,
    addSilentAudioStream,
    coverWithGreen,
    getVideoDuration,
    normalizeVideo,
    splitVideo,
    uploadFileToServer,
} from '#logic';
import {ScenarioV3} from '#types';
import {
    getRandomElementOfArray,
    getWorkingDirectoryForVideo,
    log,
    prepareCaption,
    saveFileToDisk,
} from '#utils';

type AddBannerInTheEndArgs = {
    sourceId: string;
    directoryName: string;
    mainVideoUrl: string;
    bannerVideoUrls: string[];
    scenario: ScenarioV3;
    originalHashtags: string[];
    accounts: string[];
};

export const shortify = async ({
    sourceId,
    directoryName,
    mainVideoUrl,
    bannerVideoUrls,
    originalHashtags,
    accounts = [],
    scenario,
}: AddBannerInTheEndArgs) => {
    if (!accounts.length || !scenario) {
        throw new Error('Accounts cannot be empty');
    }

    if (scenario.type !== 'ScenarioShortifyType') {
        log(
            'scenario.type error',
            scenario.type,
            'expect to be',
            'ScenarioLongVideoWithInjections',
        );
        return;
    }

    const {name: scenarioName, id: scenarioId, minDuration, maxDuration} = scenario;

    // Use a random banner URL from the array
    const bannerVideoUrl = getRandomElementOfArray(bannerVideoUrls);
    log({mainVideoUrl, bannerVideoUrl});
    const basePath = getWorkingDirectoryForVideo(directoryName);

    //download videos
    const tempFilePath1 = join(basePath, 'first.mp4');
    const tempFilePath2 = join(basePath, 'second.mp4');
    await Promise.all([
        saveFileToDisk(mainVideoUrl, tempFilePath1),
        saveFileToDisk(bannerVideoUrl, tempFilePath2),
    ]);

    const pauseTime = minDuration + Math.random() * (maxDuration - minDuration);
    const extraVideoTime = await getVideoDuration(tempFilePath2);

    // shorten video
    const shorten = await splitVideo({
        input: tempFilePath1,
        outputOverride: 'part1.mp4',
        startTime: 0,
        duration: pauseTime + extraVideoTime,
    });

    const tempFilePath1Normalized = await normalizeVideo(shorten);
    const tempFilePath2Audio = await addSilentAudioStream({input: tempFilePath2});
    const tempFilePath2Normalized = await normalizeVideo(tempFilePath2Audio);

    // concat videos
    const outputFilePath = await coverWithGreen({
        input: tempFilePath1Normalized,
        green: tempFilePath2Normalized,
        startTime: pauseTime,
        duration: extraVideoTime,
        padding: 0,
    });

    // Upload data to server
    const downloadURL = await uploadFileToServer(
        outputFilePath,
        `${directoryName}-${scenarioName}.mp4`,
    );

    // update database
    await addPreparedVideo({
        firebaseUrl: downloadURL,
        scenarioName,
        scenarioId,
        sourceId,
        title: prepareCaption(scenario),
        originalHashtags,
        accounts,
        accountsHasBeenUsed: [],
        parameters: {
            scenario,
            mainVideoUrl,
            bannerVideoUrl,
            sourceId,
            pauseTime,
            duration: await getVideoDuration(outputFilePath),
        },
    });

    // delete tempfiles
    const deleteTempFiles = true;
    if (deleteTempFiles) {
        rmSync(basePath, {recursive: true});
    }
};
