/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {join} from 'path';

import {VideoPipeline} from '../video/primitives-optimized';

import {ScenarioFunction} from './types';

import {ThrownError} from '#src/utils/error';
import {ScenarioCoverWithGreenUnique} from '#types';
import {getRandomElementOfArray, log, saveFileToDisk} from '#utils';

export const coverWithGreenScenarioOptimized: ScenarioFunction = async ({
    scenario,
    source,
    basePath,
}) => {
    log('coverWithGreenScenarioOptimized', {
        source,
        scenario,
        basePath,
    });

    const {firebaseUrl: mainVideoUrl} = source;

    const {
        options: {greenVideoUrls, loopGreen, whereToPutGreen},
    } = scenario as ScenarioCoverWithGreenUnique;

    log({mainVideoUrl});
    if (!mainVideoUrl) {
        throw new ThrownError('Main video URL is not found', 400);
    }

    const tempFilePath1 = join(basePath, 'first.mp4');
    await saveFileToDisk(mainVideoUrl, tempFilePath1);
    const mainVideo = new VideoPipeline({
        width: 720,
        height: 1280,
        isMaster: true,
    });

    await mainVideo.init(tempFilePath1);

    if (loopGreen === 'once') {
        // Handle 'once' case - place green video at start, middle, or end
        const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
        const tempFilePath2 = join(basePath, 'green.mp4');
        await saveFileToDisk(greenVideoUrl, tempFilePath2);
        const greenVideo = new VideoPipeline({
            width: 720,
            height: 1280,
        });
        await greenVideo.init(tempFilePath2);

        let startTime = 0;

        if (whereToPutGreen === 'start') {
            startTime = 0;
        } else if (
            whereToPutGreen === 'end' &&
            mainVideo.compoundDuration &&
            greenVideo.compoundDuration
        ) {
            startTime = Math.max(0, mainVideo.compoundDuration - greenVideo.compoundDuration);
        } else if (
            whereToPutGreen === 'middle' &&
            mainVideo.compoundDuration &&
            greenVideo.compoundDuration
        ) {
            startTime = Math.max(0, (mainVideo.compoundDuration - greenVideo.compoundDuration) / 2);
        }

        mainVideo.overlayWith(greenVideo, {
            startTime,
            duration: greenVideo.compoundDuration!,
            chromakey: true,
            padding: 0,
            audioMode: 'mix',
        });

        // Add random effects
        const outputPath = join(basePath, 'output.mp4');

        return await mainVideo.run(outputPath);
    } else {
        // Handle 'loop' and 'random' cases - cover the entire main video with green videos
        let totalGreenDuration = 0;
        let greenVideoIndex = 0;

        // For 'loop' case, we'll download just one video and reuse it
        // For 'random' case, we'll download multiple videos as needed
        if (loopGreen === 'loop') {
            const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
            const tempFilePath2 = join(basePath, 'green.mp4');
            await saveFileToDisk(greenVideoUrl, tempFilePath2);

            const greenVideo = new VideoPipeline({
                width: 720,
                height: 1280,
                isMaster: true,
            });
            await greenVideo.init(tempFilePath2);

            // Calculate how many times we need to loop this video
            const loopCount = Math.ceil(mainVideo.compoundDuration! / greenVideo.compoundDuration!);

            greenVideo.repeatSelf(loopCount);

            mainVideo.overlayWith(greenVideo, {
                startTime: 0,
                duration: mainVideo.compoundDuration!,
                chromakey: true,
                padding: 0,
                audioMode: 'mix',
            });
        } else if (loopGreen === 'random') {
            // Keep adding random green videos until we cover the main video duration
            while (totalGreenDuration < mainVideo.compoundDuration!) {
                const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
                const tempFilePathGreen = join(basePath, `green_${greenVideoIndex}.mp4`);
                await saveFileToDisk(greenVideoUrl, tempFilePathGreen);
                const greenVideo = new VideoPipeline({
                    width: 720,
                    height: 1280,
                });
                await greenVideo.init(tempFilePathGreen);
                mainVideo.overlayWith(greenVideo, {
                    startTime: totalGreenDuration,
                    duration: totalGreenDuration + greenVideo.compoundDuration!,
                    chromakey: true,
                    padding: 0,
                    audioMode: 'mix',
                });
                totalGreenDuration += greenVideo.compoundDuration!;
                greenVideoIndex++;
            }
        }

        // Add random effects
        const outputPath = join(basePath, 'output.mp4');

        return await mainVideo.run(outputPath);
    }
};
