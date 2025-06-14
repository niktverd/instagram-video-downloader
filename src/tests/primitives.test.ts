import {existsSync, mkdirSync} from 'fs';
import path from 'path';

import {readMetadata} from '../../src/sections/cloud-run/components/video/ffprobe.helpers';

import {getRandomElementOfArray, log, saveFileToDisk} from '#utils';
import {
    addTextToVideo,
    applyBoxBlur,
    applyMetadata,
    applyVideoColorCorrection,
    changeVideoSpeed,
    generateVideoMetadata,
    hueAdjustVideo,
    isolateRedObjects,
    rotateVideo,
} from '$/cloud-run/components/video';

log('Test primitives');

const sources: Record<string, string> = {
    blackNYellow:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
    blackNRed:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0CGS01BX79mnmrvlMuNJ.mp4?alt=media&token=375facb9-9cdd-4549-978f-b209780c93fa',
    orange: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0KqzwyzP5jzrsXEjiEHd.mp4?alt=media&token=72438526-30a1-4a7d-a318-3ffe45f1a5ff',
    green: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/1303Ew4U2hhrVAfYLOvg.mp4?alt=media&token=a5c7764d-6b6d-4f90-8841-826c5df06a62',
};

const prepareVideo = async () => {
    const basePath = path.join(__dirname, 'tests-data');
    if (!existsSync(basePath)) {
        log('creating folder ...');
        mkdirSync(basePath, {recursive: true});
    }
    const promises = Object.entries(sources).map(async ([name, url]) => {
        const filePath = path.join(basePath, `${name}.mp4`);
        await saveFileToDisk(url, filePath);

        return filePath;
    });

    return await Promise.all(promises);
};

const testApplyVideoColorCorrectionBringtness = async (filePath: string) => {
    log('testApplyVideoColorCorrectionBringtness started');
    await applyVideoColorCorrection({
        input: filePath,
        brightness: 0.5,
        pathSuffix: 'brightness-0.5',
    });
    await applyVideoColorCorrection({
        input: filePath,
        brightness: 0.1,
        pathSuffix: 'brightness-0.1',
    });
    await applyVideoColorCorrection({
        input: filePath,
        brightness: -0.1,
        pathSuffix: 'brightness-(0.1)',
    });
    await applyVideoColorCorrection({
        input: filePath,
        brightness: -0.5,
        pathSuffix: 'brightness-(0.5)',
    });
    log('testApplyVideoColorCorrectionBringtness completed');
};

const testApplyVideoColorCorrectionContrast = async (filePath: string) => {
    log('testApplyVideoColorCorrectionContrast started');
    await applyVideoColorCorrection({
        input: filePath,
        contrast: 0.5,
        pathSuffix: 'contrast-0.5',
    });
    await applyVideoColorCorrection({
        input: filePath,
        contrast: 0.9,
        pathSuffix: 'contrast-0.9',
    });
    await applyVideoColorCorrection({
        input: filePath,
        contrast: 1.1,
        pathSuffix: 'contrast-1.1',
    });
    await applyVideoColorCorrection({
        input: filePath,
        contrast: 1.5,
        pathSuffix: 'contrast-1.5',
    });
    log('testApplyVideoColorCorrectionContrast completed');
};

const testApplyVideoColorCorrectionSaturation = async (filePath: string) => {
    log('testApplyVideoColorCorrectionSaturation started');
    await applyVideoColorCorrection({
        input: filePath,
        saturation: 0.5,
        pathSuffix: 'saturation-0.5',
    });
    await applyVideoColorCorrection({
        input: filePath,
        saturation: 0.9,
        pathSuffix: 'saturation-0.9',
    });
    await applyVideoColorCorrection({
        input: filePath,
        saturation: 1.1,
        pathSuffix: 'saturation-1.1',
    });
    await applyVideoColorCorrection({
        input: filePath,
        saturation: 1.5,
        pathSuffix: 'saturation-1.5',
    });
    log('testApplyVideoColorCorrectionSaturation completed');
};

const testApplyVideoColorCorrectionGamma = async (filePath: string) => {
    log('testApplyVideoColorCorrectionGamma started');
    await applyVideoColorCorrection({
        input: filePath,
        gamma: 0.5,
        pathSuffix: 'gamma-0.5',
    });
    await applyVideoColorCorrection({
        input: filePath,
        gamma: 0.9,
        pathSuffix: 'gamma-0.9',
    });
    await applyVideoColorCorrection({
        input: filePath,
        gamma: 1.1,
        pathSuffix: 'gamma-1.1',
    });
    await applyVideoColorCorrection({
        input: filePath,
        gamma: 1.5,
        pathSuffix: 'gamma-1.5',
    });
    log('testApplyVideoColorCorrectionGamma completed');
};

const testIsolateRedObjects = async (filePath: string) => {
    log('testIsolateRedObjects started');

    await isolateRedObjects({
        input: filePath,
        color: '00FF00',
        pathSuffix: 'color-00FF00',
    });
    for (let similarity = 0.001; similarity <= 1; similarity += 0.25) {
        for (let blend = 0; blend <= 1; blend += 0.25) {
            log({similarity, blend});
            await isolateRedObjects({
                input: filePath,
                color: '00FF00',
                similarity,
                blend,
                pathSuffix: `color-00FF00-similarity-${similarity}-blend-${blend}`,
            });
        }
    }

    log('testIsolateRedObjects completed');
};

const testRotateVideo = async (filePath: string) => {
    log('testRotateVideo started');

    for (let angle = -6; angle <= -1; angle += 0.5) {
        await rotateVideo({
            input: filePath,
            angle,
            pathSuffix: `-angle-${angle}`,
        });
    }

    log('testRotateVideo completed');
};

const testAddTextToVideo = async (filePath: string) => {
    log('testAddTextToVideo started');

    await addTextToVideo({input: filePath, text: 'some text'});

    log('testAddTextToVideo completed');
};

const testChangeVideoSpeed = async (filePath: string) => {
    log('testChangeVideoSpeed started');

    await changeVideoSpeed({input: filePath, speed: 0.5});
    await changeVideoSpeed({input: filePath, speed: 1.5});

    log('testChangeVideoSpeed completed');
};

const testHueAdjustVideo = async (filePath: string) => {
    log('testHueAdjustVideo started');

    // Test different hue values (range -180 to 180)
    await hueAdjustVideo({
        input: filePath,
        hue: -90,
        pathSuffix: '-hue-minus90',
    });

    await hueAdjustVideo({
        input: filePath,
        hue: 0,
        saturation: 0.5,
        pathSuffix: '-hue0-sat0.5',
    });

    await hueAdjustVideo({
        input: filePath,
        hue: 90,
        pathSuffix: '-hue90',
    });

    await hueAdjustVideo({
        input: filePath,
        hue: 180,
        pathSuffix: '-hue180',
    });

    // Test different saturation values
    await hueAdjustVideo({
        input: filePath,
        saturation: 0,
        pathSuffix: '-sat0',
    });

    await hueAdjustVideo({
        input: filePath,
        saturation: 1.5,
        pathSuffix: '-sat1.5',
    });

    // Test combination
    await hueAdjustVideo({
        input: filePath,
        hue: 45,
        saturation: 1.2,
        pathSuffix: '-hue45-sat1.2',
    });

    log('testHueAdjustVideo completed');
};

const testApplyBoxBlur = async (filePath: string) => {
    log('testApplyBoxBlur started');

    // Test light blur
    await applyBoxBlur({
        input: filePath,
        boxWidth: 1,
        boxHeight: 1,
        iterations: 1,
        pathSuffix: '-blur-light',
    });

    // Test medium blur
    await applyBoxBlur({
        input: filePath,
        boxWidth: 3,
        boxHeight: 3,
        iterations: 1,
        pathSuffix: '-blur-medium',
    });

    // Test heavy blur
    await applyBoxBlur({
        input: filePath,
        boxWidth: 5,
        boxHeight: 5,
        iterations: 2,
        pathSuffix: '-blur-heavy',
    });

    // Test asymmetric blur
    await applyBoxBlur({
        input: filePath,
        boxWidth: 1,
        boxHeight: 5,
        iterations: 1,
        pathSuffix: '-blur-asymmetric',
    });

    // Test multiple iterations
    await applyBoxBlur({
        input: filePath,
        boxWidth: 2,
        boxHeight: 2,
        iterations: 3,
        pathSuffix: '-blur-iterations3',
    });

    log('testApplyBoxBlur completed');
};

const testMetadata = async (filePath: string) => {
    log('testMetadata started');

    // Test 1: Auto-generated metadata
    log('Test 1: Auto-generated metadata');
    const autoMetadataFile = await applyMetadata({
        input: filePath,
        outputOverride: `${path.basename(filePath, '.mp4')}_auto_metadata.mp4`,
    });
    const autoMetadata = await readMetadata(autoMetadataFile);
    log('Auto-generated metadata read from file:');
    log(autoMetadata);

    // Test 2: Custom metadata
    log('Test 2: Custom metadata');
    const customMetadata = {
        title: 'Test Title',
        artist: 'Test Artist',
        album: 'Test Album',
        genre: 'Test Genre',
        comment: 'Test Comment',
    };

    const customMetadataFile = await applyMetadata({
        input: filePath,
        metadata: customMetadata,
        outputOverride: `${path.basename(filePath, '.mp4')}_custom_metadata.mp4`,
    });

    const readCustomMetadata = await readMetadata(customMetadataFile);
    log('Custom metadata read from file:');
    log(readCustomMetadata);

    // Verify custom metadata was written and read back correctly
    log('Verifying custom metadata:');
    Object.entries(customMetadata).forEach(([key, value]) => {
        const readValue = readCustomMetadata[key];
        const match = readValue === value;
        log(`${key}: Expected "${value}", Got "${readValue}", Match: ${match}`);
    });

    // Test 3: Generated metadata from function
    log('Test 3: Generated metadata');
    const generatedMetadata = generateVideoMetadata({
        input: filePath,
        iteration: 3,
    });

    const generatedMetadataFile = await applyMetadata({
        input: filePath,
        metadata: generatedMetadata,
        outputOverride: `${path.basename(filePath, '.mp4')}_generated_metadata.mp4`,
    });

    const readGeneratedMetadata = await readMetadata(generatedMetadataFile);
    log('Generated metadata read from file:');
    log(readGeneratedMetadata);

    // Verify generated metadata was written and read back correctly
    log('Verifying generated metadata:');
    Object.entries(generatedMetadata).forEach(([key, value]) => {
        const readValue = readGeneratedMetadata[key];
        const match = readValue === value;
        log(`${key}: Expected "${value}", Got "${readValue}", Match: ${match}`);
    });

    log('testMetadata completed');
};

const runTests = async () => {
    const files = await prepareVideo();

    // applyVideoColorCorrection
    const runBrightnessTests = false;
    if (runBrightnessTests) {
        await testApplyVideoColorCorrectionBringtness(files[0]);
        await testApplyVideoColorCorrectionContrast(files[1]);
        await testApplyVideoColorCorrectionSaturation(files[2]);
        await testApplyVideoColorCorrectionGamma(files[3]);
    }

    const runIsolateRedTests = false;
    if (runIsolateRedTests) {
        await testIsolateRedObjects(files[3]);
    }

    const runRotationTests = false;
    if (runRotationTests) {
        await testRotateVideo(getRandomElementOfArray(files));
    }

    const runAddTextToVideo = false;
    if (runAddTextToVideo) {
        await testAddTextToVideo(files[1]);
    }

    const runChangeVideoSpeed = false;
    if (runChangeVideoSpeed) {
        await testChangeVideoSpeed(getRandomElementOfArray(files));
    }

    const runHueAdjustTests = false;
    if (runHueAdjustTests) {
        await testHueAdjustVideo(getRandomElementOfArray(files));
    }

    const runBoxBlurTests = false;
    if (runBoxBlurTests) {
        await testApplyBoxBlur(getRandomElementOfArray(files));
    }

    const runMetadataTest = false;
    if (runMetadataTest) {
        await testMetadata(getRandomElementOfArray(files));
    }

    log('runTest finished');
};

runTests();

//  file /Users/niktverd/code/instagram-video-downloader/src/tests/tests-data/optimized-demo-output-2.mp4.
// /Users/niktverd/code/instagram-video-downloader/src/tests/tests-data/optimized-demo-input.mp4
