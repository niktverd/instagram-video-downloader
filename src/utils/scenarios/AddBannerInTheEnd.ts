import {readFileSync, rmSync} from 'fs';
import {join} from 'path';

import {addDoc, collection} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

import {firestore, storage} from '../../config/firebase';
import {Collection} from '../../constants';
import {PreparedVideoV3, ScenarioType} from '../../types';
import {getWorkingDirectoryForVideo, saveFileToDisk} from '../../utils';
import {concatVideoFromList, normalizeVideo, saveFileList} from '../video/primitives';

type AddBannerInTheEndArgs = {
    directoryName: string;
    mainVideoUrl: string;
    bannerVideoUrl: string;
    scenarioName: string;
    title: string;
    originalHashtags: string[];
    accounts: string[];
};

export const addBannerInTheEnd = async ({
    directoryName,
    mainVideoUrl,
    bannerVideoUrl,
    scenarioName,
    title,
    originalHashtags,
    accounts = [],
}: AddBannerInTheEndArgs) => {
    if (!accounts.length) {
        throw new Error('Accounts cannot be empty');
    }

    console.log('addBannerInTheEnd', JSON.stringify({mainVideoUrl, bannerVideoUrl}));
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
    const processedBuffer = readFileSync(outputFilePath);
    const fileRef = ref(storage, `${directoryName}-scenarioName.mp4`);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);
    const downloadURL = await getDownloadURL(fileRef);
    console.log('downloadURL', downloadURL);

    // update database
    const colRef = collection(firestore, Collection.PreparedVideos);
    await addDoc(colRef, {
        firebaseUrl: downloadURL,
        scenarioType: ScenarioType.addBannerInTheEnd,
        scenarioName,
        title,
        originalHashtags,
        accounts,
    } as PreparedVideoV3);

    rmSync(basePath, {recursive: true});
};
