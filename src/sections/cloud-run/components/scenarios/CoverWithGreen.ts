import {join} from 'path';

import {addSilentAudioStream, coverWithGreen, getVideoDuration, normalizeVideo} from '../video';

import {ScenarioFunction} from './types';
import {addRandomEffects} from './utils';

import {ThrownError} from '#src/utils/error';
import {ScenarioCoverWithGreenUnique} from '#types';
import {getRandomElementOfArray, log, saveFileToDisk} from '#utils';

export const coverWithGreenScenario: ScenarioFunction = async ({scenario, source, basePath}) => {
    log('coverWithGreenScenario', {
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
    const mainDuration = await getVideoDuration(tempFilePath1);

    if (loopGreen === 'once') {
        // Handle 'once' case - place green video at start, middle, or end
        const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
        const tempFilePath2 = join(basePath, 'green.mp4');
        await saveFileToDisk(greenVideoUrl, tempFilePath2);
        const greenDuration = await getVideoDuration(tempFilePath2);

        // Normalize green video
        const tempFilePath2Audio = await addSilentAudioStream({input: tempFilePath2});
        const tempFilePath2Normalized = await normalizeVideo(tempFilePath2Audio);

        // Normalize main video
        const tempFilePath1Normalized = await normalizeVideo(tempFilePath1);

        let startTime = 0;

        if (whereToPutGreen === 'start') {
            startTime = 0;
        } else if (whereToPutGreen === 'end') {
            startTime = Math.max(0, mainDuration - greenDuration);
        } else if (whereToPutGreen === 'middle') {
            startTime = Math.max(0, (mainDuration - greenDuration) / 2);
        }

        // Apply green video overlay
        const outputFilePath = await coverWithGreen({
            input: tempFilePath1Normalized,
            green: tempFilePath2Normalized,
            startTime,
            duration: greenDuration,
            padding: 0,
        });

        // Add random effects
        return await addRandomEffects({
            input: outputFilePath,
            countOfEffects: 3,
            text: '',
        });
    } else {
        // Handle 'loop' and 'random' cases - cover the entire main video with green videos
        const greenVideoPaths = [];
        let totalGreenDuration = 0;
        let greenVideoIndex = 0;

        // For 'loop' case, we'll download just one video and reuse it
        // For 'random' case, we'll download multiple videos as needed
        if (loopGreen === 'loop') {
            const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
            const tempFilePath2 = join(basePath, 'green.mp4');
            await saveFileToDisk(greenVideoUrl, tempFilePath2);
            const greenDuration = await getVideoDuration(tempFilePath2);

            // Calculate how many times we need to loop this video
            const loopCount = Math.ceil(mainDuration / greenDuration);

            for (let i = 0; i < loopCount; i++) {
                const tempFilePathGreen = join(basePath, `green_${i}.mp4`);
                await saveFileToDisk(greenVideoUrl, tempFilePathGreen);
                const normalizedGreen = await normalizeVideo(
                    await addSilentAudioStream({input: tempFilePathGreen}),
                );
                greenVideoPaths.push(normalizedGreen);
                totalGreenDuration += greenDuration;

                // If we've covered the main video duration, stop
                if (totalGreenDuration >= mainDuration) break;
            }
        } else if (loopGreen === 'random') {
            // Keep adding random green videos until we cover the main video duration
            while (totalGreenDuration < mainDuration) {
                const greenVideoUrl = getRandomElementOfArray(greenVideoUrls);
                const tempFilePathGreen = join(basePath, `green_${greenVideoIndex}.mp4`);
                await saveFileToDisk(greenVideoUrl, tempFilePathGreen);
                const greenDuration = await getVideoDuration(tempFilePathGreen);

                const normalizedGreen = await normalizeVideo(
                    await addSilentAudioStream({input: tempFilePathGreen}),
                );
                greenVideoPaths.push(normalizedGreen);
                totalGreenDuration += greenDuration;
                greenVideoIndex++;
            }
        }

        // Normalize main video
        const tempFilePath1Normalized = await normalizeVideo(tempFilePath1);

        // Apply green videos one after another
        let currentTime = 0;
        let outputFilePath = tempFilePath1Normalized;

        for (let i = 0; i < greenVideoPaths.length; i++) {
            const greenPath = greenVideoPaths[i];
            const greenDuration = await getVideoDuration(greenPath);

            // If this would exceed the main video duration, adjust the duration
            const effectiveDuration = Math.min(greenDuration, mainDuration - currentTime);

            if (effectiveDuration <= 0) break;

            outputFilePath = await coverWithGreen({
                input: outputFilePath,
                green: greenPath,
                startTime: currentTime,
                duration: effectiveDuration,
                padding: 0,
            });

            currentTime += effectiveDuration;

            // If we've covered the main video duration, stop
            if (currentTime >= mainDuration) break;
        }

        // Add random effects
        return await addRandomEffects({
            input: outputFilePath,
            countOfEffects: 3,
            text: '',
        });
    }
};
