import {join} from 'path';

import {concatVideoFromList, normalizeVideo, saveFileList} from '../video/primitives';

import {addRandomEffects} from './utils';

import {ScenarioAddBannerAtTheEndUnique, ScenarioV4, SourceV3} from '#types';
import {log, saveFileToDisk} from '#utils';

type AddBannerInTheEndUniqueArgs = {
    scenario: ScenarioV4;
    source: SourceV3;
    basePath: string;
};

export const addBannerInTheEndUnique = async ({
    scenario,
    source,
    basePath,
}: AddBannerInTheEndUniqueArgs): Promise<string> => {
    const {extraBannerUrl} = scenario as ScenarioAddBannerAtTheEndUnique;
    const {firebaseUrl: mainVideoUrl} = source;
    log('addBannerInTheEndUnique', {mainVideoUrl, extraBannerUrl});

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
