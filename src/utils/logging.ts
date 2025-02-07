import chalk from 'chalk';

// const chalk = new Chalk();

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

    if (variant === 'open') {
        console.group(chalk.bgYellow(functionName));
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
        console.log(`[${functionName}]`, messages);
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
        console.error(`[${functionName}]`, messages);
    }
};
