/* eslint-disable @typescript-eslint/no-unused-vars */
import {existsSync, mkdirSync, readFileSync, rmSync} from 'fs';
import path from 'path';

import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

import {storage} from '../../config/firebase';
import {SECOND_VIDEO} from '../../constants';
import {MediaPostModel} from '../../types';
import {saveFileToDisk} from '../../utils';

import {
    addSilentAudioStream,
    checkHasAudio,
    concatVideoFromList,
    coverWithGreen,
    createVideoOfFrame,
    extractFrames,
    getVideoDuration,
    // logStreamsInfo,
    normalizeVideo,
    saveFileList,
    splitVideo,
} from './primitives';

const pauseSourcePath = '/Users/niktverd/code/instagram-video-downloader/greenPause.mp4';
const playSourcePath = '/Users/niktverd/code/instagram-video-downloader/greenPlay.mp4';

export const splitVideoInTheMiddle = async (data: MediaPostModel, firestoreId: string) => {
    const {sources} = data;
    if (!sources.instagramReel?.url || !firestoreId) {
        return;
    }

    const basePath = path.join(__dirname, firestoreId);
    if (!existsSync(basePath)) {
        mkdirSync(basePath, {recursive: true});
    }

    const tempFilePath1 = path.join(basePath, 'first.mp4');
    const tempFilePath2 = path.join(basePath, 'second.mp4');
    const outputFilePath = path.join(basePath, `output.mp4`);
    const mylistPath = path.join(basePath, `mylist.txt`);

    await Promise.all([
        saveFileToDisk(sources.instagramReel.url, tempFilePath1),
        saveFileToDisk(SECOND_VIDEO, tempFilePath2),
    ]);

    const file1Duration = await getVideoDuration(tempFilePath1);
    const file2Duration = await getVideoDuration(tempFilePath2);
    const pauseTime = file1Duration / 2;
    console.log('times: ', JSON.stringify({file1Duration, file2Duration, pauseTime}));

    // format videos
    const tempFilePath1Formated = await normalizeVideo(tempFilePath1);
    const tempFilePath2Formated = await normalizeVideo(tempFilePath2);
    const playNormalizedPath = await normalizeVideo(playSourcePath);
    const greenPlayWithAudioPath = await addSilentAudioStream({
        input: playNormalizedPath,
    });
    const pauseNormalizedPath = await normalizeVideo(pauseSourcePath);
    const greenPauseWithAudioPath = await addSilentAudioStream({
        input: pauseNormalizedPath,
    });
    const pauseDuration = await getVideoDuration(pauseNormalizedPath);
    const playDuration = await getVideoDuration(playNormalizedPath);
    const part1FilePath = await splitVideo({
        input: tempFilePath1Formated,
        outputOverride: 'part1.mp4',
        startTime: 0,
        duration: pauseTime,
    });
    const part2FilePath = await splitVideo({
        input: tempFilePath1Formated,
        outputOverride: 'part2.mp4',
        startTime: pauseTime,
    });
    // Create a still frame
    const frameFilePath = await extractFrames({
        input: tempFilePath1Formated,
        startTime: pauseTime,
    });
    // Create a video from the still frame
    const pauseFilePath = await createVideoOfFrame({
        input: frameFilePath,
        duration: file2Duration,
    });

    const hasAudio = await checkHasAudio(pauseFilePath);

    console.log({hasAudio});

    const pauseWithAudioFilePath = await addSilentAudioStream({
        input: pauseFilePath,
    });

    const pauseWithAudioReencodedFilePath = await normalizeVideo(pauseWithAudioFilePath);

    saveFileList(mylistPath, part1FilePath, pauseWithAudioReencodedFilePath, part2FilePath);
    await concatVideoFromList(mylistPath, outputFilePath);

    // await logStreamsInfo(outputFilePath);

    const greenInsertionPath = await coverWithGreen({
        input: outputFilePath,
        // output: greenInsertionPath,
        green: tempFilePath2Formated,
        startTime: pauseTime,
        duration: file2Duration,
        padding: 120,
    });

    const greenPausePath = await coverWithGreen({
        input: greenInsertionPath,
        green: greenPauseWithAudioPath,
        startTime: pauseTime - 1,
        duration: pauseDuration,
    });

    console.log(playDuration);

    const greenPlayPath = await coverWithGreen({
        input: greenPausePath,
        green: greenPlayWithAudioPath,
        startTime: pauseTime + file2Duration - 0.25,
        duration: playDuration,
    });

    // await logStreamsInfo(greenPlayPath);

    // Upload data to server
    const processedBuffer = readFileSync(greenPlayPath);
    const fileRef = ref(storage, `${firestoreId}-splited.mp4`);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);

    const downloadURL = await getDownloadURL(fileRef);
    console.log(downloadURL);

    // Clean up temporary files (optional) - use with caution in production!

    if (process.env.lsdkfjsld) {
        rmSync(basePath, {recursive: true});
    }
};
