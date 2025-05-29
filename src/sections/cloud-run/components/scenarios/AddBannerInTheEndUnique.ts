import {join} from 'path';

import {concatVideoFromList, normalizeVideo, saveFileList} from '../video/primitives';

import {ScenarioFunction} from './types';
import {addRandomEffects} from './utils';

import {ThrownError} from '#src/utils/error';
import {ScenarioAddBannerAtTheEndUnique} from '#types';
import {log, saveFileToDisk} from '#utils';

export const addBannerInTheEndUnique: ScenarioFunction = async ({
    scenario,
    source,
    basePath,
}): Promise<string> => {
    const {
        options: {extraBannerUrl},
    } = scenario as ScenarioAddBannerAtTheEndUnique;
    const {firebaseUrl: mainVideoUrl} = source;
    log('addBannerInTheEndUnique', {mainVideoUrl, extraBannerUrl});

    if (!mainVideoUrl) {
        throw new ThrownError('Main video URL is not found', 400);
    }
    if (!extraBannerUrl) {
        throw new ThrownError('Extra banner URL is not found', 400);
    }

    //download videos
    const tempFilePath1 = join(basePath, 'first.mp4');
    const tempFilePath2 = join(basePath, 'second.mp4');
    await Promise.all([
        saveFileToDisk(mainVideoUrl, tempFilePath1),
        saveFileToDisk(extraBannerUrl, tempFilePath2),
    ]);
    const tempFilePath1Normalized = await normalizeVideo(tempFilePath1);
    const tempFilePath2Normalized = await normalizeVideo(tempFilePath2);

    // concat videos
    const outputListPath = join(basePath, 'outputList.txt');
    const outputFilePath = join(basePath, 'output.mp4');
    saveFileList(outputListPath, tempFilePath1Normalized, tempFilePath2Normalized);
    await concatVideoFromList(outputListPath, outputFilePath);

    // uniqalize
    return await addRandomEffects({
        input: outputFilePath,
        countOfEffects: 3,
        text: '',
    });
};
