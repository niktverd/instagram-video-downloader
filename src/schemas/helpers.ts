export const queryToNumberArray = (val: unknown): number[] => {
    if (!val) {
        return [];
    }
    if (Array.isArray(val)) {
        return val.map(Number).filter((n) => !isNaN(n));
    }
    if (typeof val === 'string') {
        return [Number(val)].filter((n) => !isNaN(n));
    }
    if (typeof val === 'number') {
        return [val];
    }
    return [];
};

export const queryToBoolean = (val: unknown): boolean => {
    if (typeof val === 'boolean') {
        return val;
    }
    if (typeof val === 'string') {
        return val.toLowerCase() === 'true' || val === '1';
    }
    if (typeof val === 'number') {
        return val !== 0;
    }
    return false;
};

export const queryToNumber = (val: unknown): number | undefined => {
    if (typeof val === 'number') {
        return val;
    }

    const num = Number(val);
    if (isNaN(num)) {
        return undefined;
    }

    return num;
};
