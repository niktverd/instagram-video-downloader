import {randomBetween} from '../logic/video/utils';
import {log} from '../utils';

log('Test utils');

const runTests = async () => {
    for (let i = 0; i < 10; i++) {
        const min = Math.random();
        const max = Math.random();
        const randomVal = randomBetween(min, max);
        log({min, randomVal, max});
    }

    log('runTest finished');
};

runTests();
