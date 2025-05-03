import {existsSync, mkdirSync} from 'fs';
import path from 'path';

import {log, saveFileToDisk} from '#utils';
import {
    addTextToVideo,
    applyVideoColorCorrection,
    changeVideoSpeed,
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

    for (let angle = -5; angle <= 5; angle += 2) {
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
        await testRotateVideo(files[1]);
    }

    const runAddTextToVideo = false;
    if (runAddTextToVideo) {
        await testAddTextToVideo(files[1]);
    }

    const runChangeVideoSpeed = false;
    if (runChangeVideoSpeed) {
        await testChangeVideoSpeed(files[1]);
    }

    log('runTest finished');
};

runTests();
