import {join} from 'path';

import {
    addSilentAudioStream,
    coverWithGreen,
    getVideoDuration,
    normalizeVideo,
    splitVideo,
} from '../video';

import {ScenarioFunction} from './types';
import {addRandomEffects} from './utils';

import {ThrownError} from '#src/utils/error';
import {ScenarioShortifyUnique} from '#types';
import {getRandomElementOfArray, log, saveFileToDisk} from '#utils';

export const shortifyUnique: ScenarioFunction = async ({scenario, source, basePath}) => {
    log('shortifyUnique', {
        source,
        scenario,
        basePath,
    });

    const {firebaseUrl: mainVideoUrl} = source;

    const {
        options: {minDuration, maxDuration, extraBannerUrls: bannerVideoUrls},
    } = scenario as ScenarioShortifyUnique;

    // Use the first banner URL from the array
    const bannerVideoUrl = getRandomElementOfArray(bannerVideoUrls);
    log({mainVideoUrl, bannerVideoUrl});
    if (!bannerVideoUrl) {
        throw new ThrownError('Banner video URL is not found', 400);
    }
    if (!mainVideoUrl) {
        throw new ThrownError('Main video URL is not found', 400);
    }

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
    return await addRandomEffects({
        input: outputFilePath,
        countOfEffects: 3,
        // text: accounts[0],
        text: '',
    });
};
