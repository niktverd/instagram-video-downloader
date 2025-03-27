export const randomBetween = (min: number, max: number) => {
    const localMin = Math.min(min, max);
    const localMax = Math.max(min, max);

    const diff = localMax - localMin;
    const randomPart = Math.random() * diff;

    return localMin + randomPart;
};
