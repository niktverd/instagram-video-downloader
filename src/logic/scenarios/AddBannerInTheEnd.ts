import {rmSync} from 'fs';
import {join} from 'path';

import {concatVideoFromList, normalizeVideo, saveFileList} from '../../logic/video/primitives';
import {getWorkingDirectoryForVideo, saveFileToDisk} from '../../utils/common';
import {log} from '../../utils/logging';
import {addPreparedVideo, uploadFileToServer} from '../firebase/prepared-videos';

type AddBannerInTheEndArgs = {
    sourceId: string;
    directoryName: string;
    mainVideoUrl: string;
    bannerVideoUrl: string;
    scenarioName: string;
    scenarioId: string;
    title: string;
    originalHashtags: string[];
    accounts: string[];
};

export const addBannerInTheEnd = async ({
    sourceId,
    directoryName,
    mainVideoUrl,
    bannerVideoUrl,
    scenarioName,
    scenarioId,
    title,
    originalHashtags,
    accounts = [],
}: AddBannerInTheEndArgs) => {
    if (!accounts.length) {
        throw new Error('Accounts cannot be empty');
    }

    log('addBannerInTheEnd', {mainVideoUrl, bannerVideoUrl});
    const basePath = getWorkingDirectoryForVideo(directoryName);

    //download videos
    const tempFilePath1 = join(basePath, 'first.mp4');
    const tempFilePath2 = join(basePath, 'second.mp4');
    await Promise.all([
        saveFileToDisk(mainVideoUrl, tempFilePath1),
        saveFileToDisk(bannerVideoUrl, tempFilePath2),
    ]);
    const tempFilePath1Normalized = await normalizeVideo(tempFilePath1);
    const tempFilePath2Normalized = await normalizeVideo(tempFilePath2);

    // concat videos
    const outputListPath = join(basePath, 'outputList.txt');
    const outputFilePath = join(basePath, 'output.mp4');
    saveFileList(outputListPath, tempFilePath1Normalized, tempFilePath2Normalized);
    await concatVideoFromList(outputListPath, outputFilePath);

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
        title,
        originalHashtags,
        accounts,
        accountsHasBeenUsed: [],
    });

    // delete tempfiles
    rmSync(basePath, {recursive: true});
};
