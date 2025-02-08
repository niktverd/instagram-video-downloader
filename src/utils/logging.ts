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

function getCallerDepth() {
    const error = new Error();
    const stack = error.stack?.split('\n');
    // Ищем глубину вызова, считая количество строк стека до текущей функции
    return stack?.slice(3).length || 0; // Игнорируем первые 3 строки (ошибка, getCallerDepth, logWithFunctionName)
}

const getCallerFunctionName = () => {
    const error = new Error();
    const stack = error.stack?.split('\n');
    // Обычно название функции находится в третьей строке стека
    const callerLine = stack?.[3];
    const match = callerLine?.match(/at (\w+)/);
    return match ? match[1] : 'anonymous';
};

export const logGroup = async (variant: 'open' | 'close') => {
    const functionName = getCallerFunctionName();
    let depth = getCallerDepth();
    if (depth >= chalkMap.length) {
        depth = chalkMap.length - 1;
    }

    if (variant === 'open') {
        console.group(chalkMap[depth](functionName));
    } else {
        console.groupEnd();
    }
};

export const log = (...messages: unknown[]) => {
    const isDevelopment = process.env.APP_ENV === 'development';
    const functionName = getCallerFunctionName();
    if (isDevelopment) {
        console.log(...messages);
    } else {
        console.log(`[${functionName}]`, JSON.stringify(messages));
    }
};

export const logError = (...messages: unknown[]) => {
    const isDevelopment = process.env.APP_ENV === 'development';
    const functionName = getCallerFunctionName();
    if (isDevelopment) {
        console.group(chalk.bgRed(functionName));
        console.error(...messages);
        console.groupEnd();
    } else {
        console.error(`[${functionName}]`, JSON.stringify(messages));
    }
};
