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
    logStreamsInfo,
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
    const tempFilePath1Formated = path.join(basePath, `first-formated.mp4`);
    const tempFilePath2Formated = path.join(basePath, `second-formated.mp4`);
    const outputFilePath = path.join(basePath, `output.mp4`);
    const part1FilePath = path.join(basePath, `part1.mp4`);
    const part2FilePath = path.join(basePath, `part2.mp4`);
    const pauseFilePath = path.join(basePath, `pause.mp4`);
    const pauseWithAudioFilePath = path.join(basePath, `pauseWithAudio.mp4`);
    const pauseWithAudioReencodedFilePath = path.join(basePath, `pauseWithAudioReencoded.mp4`);
    const frameFilePath = path.join(basePath, `frame.png`);
    const mylistPath = path.join(basePath, `mylist.txt`);
    const greenPausePath = path.join(basePath, `greenPause.mp4`);
    const greenPlayPath = path.join(basePath, `greenPlay.mp4`);
    const greenInsertionPath = path.join(basePath, `greenInsertion.mp4`);
    const pauseNormalizedPath = path.join(basePath, `pauseNormalized.mp4`);
    const playNormalizedPath = path.join(basePath, `playNormalized.mp4`);

    await Promise.all([
        saveFileToDisk(sources.instagramReel.url, tempFilePath1),
        saveFileToDisk(SECOND_VIDEO, tempFilePath2),
    ]);

    const file1Duration = await getVideoDuration(tempFilePath1);
    const file2Duration = await getVideoDuration(tempFilePath2);
    const pauseTime = file1Duration / 2;
    console.log({file1Duration, file2Duration, pauseTime});

    // format videos
    await normalizeVideo(tempFilePath1, tempFilePath1Formated);
    await normalizeVideo(tempFilePath2, tempFilePath2Formated);
    await normalizeVideo(playSourcePath, playNormalizedPath);
    await normalizeVideo(pauseSourcePath, pauseNormalizedPath);
    const pauseDuration = await getVideoDuration(pauseNormalizedPath);
    const playDuration = await getVideoDuration(playNormalizedPath);
    await splitVideo({
        input: tempFilePath1Formated,
        output: part1FilePath,
        startTime: 0,
        duration: pauseTime,
    });
    await splitVideo({
        input: tempFilePath1Formated,
        output: part2FilePath,
        startTime: pauseTime,
    });
    // Create a still frame
    await extractFrames({
        input: tempFilePath1Formated,
        startTime: pauseTime,
        output: frameFilePath,
    });
    // Create a video from the still frame
    await createVideoOfFrame({
        input: frameFilePath,
        output: pauseFilePath,
        duration: file2Duration,
    });

    const hasAudio = await checkHasAudio(pauseFilePath);

    console.log({hasAudio});

    await addSilentAudioStream({
        input: pauseFilePath,
        output: pauseWithAudioFilePath,
        duration: file2Duration,
        hasAudio,
    });

    await normalizeVideo(pauseWithAudioFilePath, pauseWithAudioReencodedFilePath);

    saveFileList(mylistPath, part1FilePath, pauseWithAudioReencodedFilePath, part2FilePath);
    await concatVideoFromList(mylistPath, outputFilePath);

    await logStreamsInfo(outputFilePath);

    await coverWithGreen({
        input: outputFilePath,
        output: greenPausePath,
        green: pauseNormalizedPath,
        startTime: pauseTime - 1,
        duration: pauseDuration,
    });

    console.log(playDuration);

    await coverWithGreen({
        input: greenPausePath,
        output: greenPlayPath,
        green: playNormalizedPath,
        startTime: pauseTime + file2Duration - 0.25,
        duration: playDuration,
    });

    await coverWithGreen({
        input: greenPlayPath,
        output: greenInsertionPath,
        green: tempFilePath2Formated,
        startTime: pauseTime,
        duration: file2Duration,
        padding: 120,
    });

    // Upload data to server
    const processedBuffer = readFileSync(outputFilePath);
    const fileRef = ref(storage, `${firestoreId}-splited.mp4`);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);

    const downloadURL = await getDownloadURL(fileRef);
    console.log(downloadURL);

    // Clean up temporary files (optional) - use with caution in production!

    rmSync(basePath, {recursive: true});
};
