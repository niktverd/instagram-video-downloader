import {rmSync} from 'fs';
import {join} from 'path';

import {
    addSilentAudioStream,
    coverWithGreen,
    getVideoDuration,
    normalizeVideo,
    splitVideo,
} from '../video';

import {addRandomEffects} from './utils';

import {ScenarioV3} from '#types';
import {
    getRandomElementOfArray,
    getWorkingDirectoryForVideo,
    log,
    prepareCaption,
    saveFileToDisk,
} from '#utils';
import {addPreparedVideo, uploadFileToServer} from '$/shared';

type ShortifyUniqueArgs = {
    sourceId: string;
    directoryName: string;
    mainVideoUrl: string;
    bannerVideoUrls: string[];
    scenario: ScenarioV3;
    originalHashtags: string[];
    accounts: string[];
};

export const shortifyUnique = async ({
    sourceId,
    directoryName,
    mainVideoUrl,
    bannerVideoUrls,
    originalHashtags,
    accounts = [],
    scenario,
}: ShortifyUniqueArgs) => {
    log('shortifyUnique', {
        sourceId,
        directoryName,
        mainVideoUrl,
        bannerVideoUrls,
        originalHashtags,
        accounts,
        scenario,
    });
    if (!accounts.length || !scenario) {
        throw new Error('Accounts and scenario cannot be empty');
    }

    if (scenario.type !== 'ScenarioShortifyUniqueType') {
        log('scenario.type error', scenario.type, 'expect to be', 'ScenarioShortifyUniqueType');
        return;
    }

    log('scenario accepted', scenario);

    const {name: scenarioName, id: scenarioId, minDuration, maxDuration} = scenario;

    // Use the first banner URL from the array
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

    // uniqalize
    const finalFilePath = await addRandomEffects({
        input: outputFilePath,
        countOfEffects: 3,
        text: accounts[0],
    });

    // Upload data to server
    const downloadURL = await uploadFileToServer(
        finalFilePath,
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
            duration: await getVideoDuration(finalFilePath),
        },
    });

    // delete tempfiles
    const deleteTempFiles = true;
    if (deleteTempFiles) {
        rmSync(basePath, {recursive: true});
    }
};
