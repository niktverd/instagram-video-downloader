import {shuffle} from 'lodash';

import {addTextToVideo, applyVideoColorCorrection, rotateVideo} from '../video';
import {randomBetween} from '../video/utils';
import { log } from '../../utils';

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

const arrayOfEffects = [
    updateBrightness,
    updateContrast,
    updateSaturation,
    updateGamma,
    updateRotation,
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
        console.log('\n\n', output);
    }

    const disableText = true;

    if (text && !disableText) {
        output = await addTextToVideo({input: output, text});
    }

    return output;
};

export const getRandomElementOfArray = <T>(array: T[]): T | undefined => {
    const randomIndex = Math.ceil(Array.length * Math.random());

    log({array, randomIndex});

    return array[randomIndex];
};
