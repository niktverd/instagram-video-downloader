import {readFileSync} from 'fs';

import chalk from 'chalk';

const chalkMap = [
    chalk.bgBlue,
    chalk.bgCyan,
    chalk.bgGray,
    chalk.bgGreen,
    chalk.bgMagenta,
    chalk.bgRed,
    chalk.bgWhite,
    chalk.bgYellow,
    chalk.bgBlueBright,
    chalk.bgCyanBright,
    chalk.bgGreenBright,
    chalk.bgMagentaBright,
    chalk.bgRedBright,
    chalk.bgWhiteBright,
    chalk.bgYellowBright,
];

const getGroupLabels = () => {
    const error = new Error();
    const stack = error.stack?.split('\n');
    const functions = stack?.slice(3) || [];
    const stackPrepared: string[] = [];
    for (let i = 0; i < functions.length; i++) {
        if (!functions[i]) {
            continue;
        }

        const match = functions[i].match(/at (\w+)/);

        const localDepth = i < chalkMap.length ? i : chalkMap.length - 1;
        stackPrepared.push(chalkMap[localDepth](match ? match[1] : 'anonymous'));
    }

    return stackPrepared;
};

export const log = (...messages: unknown[]) => {
    let reqId = '';
    try {
        reqId = readFileSync('reqId.log', 'utf8');
    } catch (error) {
        console.error('Error reading reqId.log', error);
    }
    const isDevelopment = process.env.APP_ENV === 'development';
    const groupLabels = getGroupLabels();
    console.group(...groupLabels);
    if (isDevelopment) {
        console.log(reqId, ...messages);
    } else {
        console.log(JSON.stringify({reqId, ...messages}));
    }
    console.groupEnd();
};

export const logError = (...messages: unknown[]) => {
    let reqId = '';
    try {
        reqId = readFileSync('reqId.log', 'utf8');
    } catch (error) {
        console.error('Error reading reqId.log', error);
    }
    const isDevelopment = process.env.APP_ENV === 'development';
    const groupLabels = getGroupLabels();
    console.group(chalk.bgRed('ERROR'));
    console.group(...groupLabels);
    if (isDevelopment) {
        console.error(reqId, ...messages);
    } else {
        console.error(JSON.stringify({reqId, ...messages}));
    }
    console.groupEnd();
    console.groupEnd();
};
