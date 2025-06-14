import {shuffle} from 'lodash';

import {addTextToVideo, applyVideoColorCorrection, changeVideoSpeed, rotateVideo} from '../video';
import {
    applyBoxBlur,
    applyMetadata,
    generateVideoMetadata,
    hueAdjustVideo,
} from '../video/primitives';
import {randomBetween} from '../video/utils';

import {log} from '#utils';

const updateBrightness = async (filePath: string) => {
    return applyVideoColorCorrection({input: filePath, brightness: randomBetween(-0.3, 0.3)});
};
const updateContrast = async (filePath: string) => {
    return applyVideoColorCorrection({input: filePath, contrast: randomBetween(0.7, 1.5)});
};
const updateSaturation = async (filePath: string) => {
    return applyVideoColorCorrection({input: filePath, saturation: randomBetween(0.5, 1.5)});
};
const updateGamma = async (filePath: string) => {
    return applyVideoColorCorrection({input: filePath, gamma: randomBetween(0.7, 1.3)});
};
const updateRotation = async (filePath: string) => {
    return rotateVideo({input: filePath, angle: randomBetween(-10, 10)});
};
const updateVideoSpeed = async (filePath: string) => {
    return changeVideoSpeed({input: filePath, speed: randomBetween(0.87, 1.15)});
};
const updateVideoMetadata = async (filePath: string) => {
    return applyMetadata({
        input: filePath,
        metadata: generateVideoMetadata({input: filePath, iteration: 1}),
    });
};
const updateHue = async (filePath: string) => {
    return hueAdjustVideo({
        input: filePath,
        hue: randomBetween(-10, 10),
        saturation: randomBetween(0.5, 1.5),
    });
};
const updateBlur = async (filePath: string) => {
    return applyBoxBlur({
        input: filePath,
        iterations: randomBetween(1, 2),
        boxHeight: randomBetween(1, 2),
        boxWidth: randomBetween(1, 2),
    });
};

const arrayOfEffects = [
    updateBrightness,
    updateContrast,
    updateSaturation,
    updateGamma,
    updateRotation,
    updateHue,
    updateBlur,
];

type AddRandomEffectsArgs = {
    input: string;
    countOfEffects: number;
    text?: string;
};

export const addRandomEffects = async ({input, countOfEffects = 1, text}: AddRandomEffectsArgs) => {
    let output = input;
    const suffled = shuffle(arrayOfEffects);

    for (let i = 0; i < countOfEffects; i++) {
        output = await suffled[i](output);
        log('\n\n', output);
    }

    const disableText = true;

    if (text && !disableText) {
        output = await addTextToVideo({input: output, text});
    }

    output = await updateVideoSpeed(output);
    output = await updateVideoMetadata(output);
    return output;
};
