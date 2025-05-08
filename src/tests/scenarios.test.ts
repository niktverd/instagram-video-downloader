import {existsSync, mkdirSync} from 'fs';
import path from 'path';

import {Timestamp} from 'firebase/firestore/lite';

import {ScenarioName} from '../types/scenario';
import {getWorkingDirectoryForVideo, log, saveFileToDisk} from '../utils';

import {ScenarioType} from '#schemas/scenario';
import {addBannerInTheEndUnique} from '$/cloud-run/components/scenarios/AddBannerInTheEndUnique';
import {shortifyUnique} from '$/cloud-run/components/scenarios/ShortifyUnique';

log('Test primitives');

const sources: Record<string, string> = {
    blackNYellow:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
    blackNRed:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0CGS01BX79mnmrvlMuNJ.mp4?alt=media&token=375facb9-9cdd-4549-978f-b209780c93fa',
    orange: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0KqzwyzP5jzrsXEjiEHd.mp4?alt=media&token=72438526-30a1-4a7d-a318-3ffe45f1a5ff',
    green: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/1303Ew4U2hhrVAfYLOvg.mp4?alt=media&token=a5c7764d-6b6d-4f90-8841-826c5df06a62',
};

const bannerVideoUrls = [
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsimple-scenario-video%2F0.23519186565978023.mp4?alt=media&token=c8c549da-ea27-45e9-9e9c-17be547eb759',
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsimple-scenario-video%2F0.5746131737553568.mp4?alt=media&token=001c9b6e-8a39-432b-bbf1-2b40ea50346f',
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsimple-scenario-video%2F0.6282365561765657.mp4?alt=media&token=74abb6ac-c21a-4099-9418-d7bf8ac0459f',
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsimple-scenario-video%2F0.7450300474463101.mp4?alt=media&token=4990348f-e985-4cb3-bc03-124ccd3ff8e5',
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsimple-scenario-video%2F0.9583381927006516.mp4?alt=media&token=850d3d16-5138-43bf-9c37-e4552e9c930a',
];

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
    const directoryName = `test-testAddBannerInTheEndUnique`;

    const basePath = getWorkingDirectoryForVideo(directoryName);
    await addBannerInTheEndUnique({
        source: {
            id: '123',
            sources: {
                instagramReel: {
                    url: filePath,
                    senderId: '123',
                    owner: '123',
                    title: 'test',
                    originalHashtags: [],
                },
            },
            createdAt: new Timestamp(new Date().getTime(), 0),
            firebaseUrl:
                'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
            randomIndex: 0,
            bodyJSONString: {},
            attempt: 0,
            scenarios: [],
            lastUsed: new Timestamp(new Date().getTime(), 0),
            timesUsed: 0,
            scenariosHasBeenCreated: [],
        },
        scenario: {
            id: '1',
            slug: ScenarioName.ScenarioAddBannerAtTheEndUnique,
            type: ScenarioType.ScenarioAddBannerAtTheEndUnique,
            onlyOnce: false,
            enabled: true,
            texts: {},
            extraBannerUrls: [
                'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Fdima%2Fsiimple_scenario_img%2F1.png?alt=media&token=269f0e5b-bfbb-49c3-b395-faba9c86573a',
            ],
            extraBannerUrl: '',
        },
        basePath,
    });
};

const testShortify = async (_filePath: string) => {
    // await shortify({
    //     sourceId: '123',
    //     directoryName: 'test',
    //     mainVideoUrl: filePath,
    //     bannerVideoUrls: [bannerVideoUrls[0]],
    //     originalHashtags: [],
    //     accounts: ['@someaccount.gamble'],
    //     scenario: {
    //         id: '1',
    //         name: ScenarioName.ScenarioShortify,
    //         type: 'ScenarioShortifyType',
    //         onlyOnce: false,
    //         enabled: true,
    //         texts: {},
    //         extraBannerUrls: [bannerVideoUrls[0]],
    //         minDuration: 3,
    //         maxDuration: 5,
    //     },
    // });
};

const testShortifyUnique = async (filePath: string) => {
    const directoryName = `test-testShortifyUnique`;

    const basePath = getWorkingDirectoryForVideo(directoryName);
    await shortifyUnique({
        source: {
            id: '123',
            sources: {
                instagramReel: {
                    url: filePath,
                    senderId: '123',
                    owner: '123',
                    title: 'test',
                    originalHashtags: [],
                },
            },
            createdAt: new Timestamp(new Date().getTime(), 0),
            firebaseUrl:
                'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
            randomIndex: 0,
            bodyJSONString: {},
            attempt: 0,
            scenarios: [],
            lastUsed: new Timestamp(new Date().getTime(), 0),
            timesUsed: 0,
            scenariosHasBeenCreated: [],
        },
        // directoryName: 'test',
        // mainVideoUrl: filePath,
        // bannerVideoUrls: [bannerVideoUrls[0]],
        // originalHashtags: [],
        // accounts: ['@someaccount.gamble'],
        scenario: {
            id: '1',
            slug: ScenarioName.ScenarioShortifyUnique,
            type: ScenarioType.ScenarioShortifyUnique,
            onlyOnce: false,
            enabled: true,
            texts: {},
            extraBannerUrls: [bannerVideoUrls[0]],
            minDuration: 3,
            maxDuration: 5,
        },
        basePath,
    });
};

const runTests = async () => {
    const runAddBannerInTheEndUnique = false;
    if (runAddBannerInTheEndUnique) {
        await testAddBannerInTheEndUnique(sources.blackNYellow);
    }

    const runShortify = false;
    if (runShortify) {
        await testShortify(sources.blackNYellow);
    }

    const runShortifyUnique = false;
    if (runShortifyUnique) {
        await testShortifyUnique(sources.blackNYellow);
    }

    log('runTest finished');
};

runTests();
