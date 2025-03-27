import {existsSync, mkdirSync} from 'fs';
import path from 'path';

import {addBannerInTheEndUnique} from '../logic/scenarios/AddBannerInTheEndUnique';
import {ScenarioName} from '../types/scenario';
import {log, saveFileToDisk} from '../utils';

log('Test primitives');

const sources: Record<string, string> = {
    blackNYellow:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
    blackNRed:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0CGS01BX79mnmrvlMuNJ.mp4?alt=media&token=375facb9-9cdd-4549-978f-b209780c93fa',
    orange: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0KqzwyzP5jzrsXEjiEHd.mp4?alt=media&token=72438526-30a1-4a7d-a318-3ffe45f1a5ff',
    green: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/1303Ew4U2hhrVAfYLOvg.mp4?alt=media&token=a5c7764d-6b6d-4f90-8841-826c5df06a62',
};

export const prepareVideo = async () => {
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

const testAddBannerInTheEndUnique = async (filePath: string) => {
    await addBannerInTheEndUnique({
        sourceId: '123',
        directoryName: 'test',
        mainVideoUrl: filePath,
        bannerVideoUrl:
            'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsiimple_scenario_img%2F1.png?alt=media&token=269f0e5b-bfbb-49c3-b395-faba9c86573a',
        originalHashtags: [],
        accounts: ['@someaccount.gamble'],
        scenario: {
            id: '1',
            name: ScenarioName.ScenarioAddBannerAtTheEndUnique,
            type: 'ScenarioAddBannerAtTheEndUnique',
            onlyOnce: false,
            enabled: true,
            texts: {},
            extraBannerUrl:
                'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsiimple_scenario_img%2F1.png?alt=media&token=269f0e5b-bfbb-49c3-b395-faba9c86573a',
        },
    });
};

const runTests = async () => {
    const runAddBannerInTheEndUnique = true;
    if (runAddBannerInTheEndUnique) {
        await testAddBannerInTheEndUnique(sources.blackNYellow);
    }

    log('runTest finished');
};

runTests();
