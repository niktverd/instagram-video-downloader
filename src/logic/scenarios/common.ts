import {DelayMS} from '../../constants';
import {getRandomElementOfArray} from '../../utils';
import {log, logError} from '../../utils/logging';
import {getAccounts} from '../firebase/accounts';
import {getOneRandomVideo} from '../firebase/firebase';
import {getScenarios, regScenarioUsage} from '../firebase/scenarios';

import {addBannerInTheEnd} from './AddBannerInTheEnd';
import {addBannerInTheEndUnique} from './AddBannerInTheEndUnique';
import {coverWithImage} from './CoverWithImage';
import {shortify} from './Shortify';

export const runScenarioAddBannerAtTheEnd = async () => {
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        for (const scenario of scenarios) {
            try {
                if (!scenario) {
                    log(['!scenario', scenario, scenarios]);
                    return;
                }

                if (scenario.type !== 'ScenarioAddBannerAtTheEnd') {
                    continue;
                }

                const randomScenarioName = scenario.name;
                const accountsByScenario = accounts.filter((account) =>
                    account.availableScenarios?.includes(randomScenarioName),
                );

                const oneRandomVideo = await getOneRandomVideo(scenario.name);
                if (!oneRandomVideo) {
                    log('!oneRandomVideo', oneRandomVideo);
                    return;
                }

                const {firebaseUrl, id, sources} = oneRandomVideo;
                const originalHashtags = sources.instagramReel?.originalHashtags || [];
                log({accountsByScenario, scenario, randomVideoId: id});

                if (!firebaseUrl) {
                    console.log('no firebase url');
                    return;
                }

                await addBannerInTheEnd({
                    sourceId: id,
                    mainVideoUrl: firebaseUrl,
                    bannerVideoUrl: scenario.extraBannerUrl,
                    directoryName: id,
                    scenario,
                    originalHashtags,
                    accounts: accountsByScenario.map(({id: accountName}) => accountName),
                });

                if (scenario.onlyOnce) {
                    log('scenario.onlyOnce');
                    // update video.scenario with scenario name
                    await regScenarioUsage(oneRandomVideo, scenario.name);
                }
            } catch (error: unknown) {
                logError(String(error));
            }
        }
    } catch (error) {
        logError(error);
        console.log(error);
    }
};

export const runScenarioAddBannerAtTheEndUnique = async () => {
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        let oneRandomVideo;

        for (const account of accounts) {
            const accountScenarios = account.availableScenarios || [];
            for (const accountScenario of accountScenarios) {
                try {
                    const scenario = scenarios.find(({name}) => name === accountScenario);
                    if (!scenario) {
                        log(['!scenario', scenario, scenarios]);
                        return;
                    }

                    if (scenario.type !== 'ScenarioAddBannerAtTheEndUnique') {
                        continue;
                    }
                    log({scenario});

                    const accountsByScenario = [account];

                    if (!oneRandomVideo) {
                        oneRandomVideo = await getOneRandomVideo(scenario.name);
                    }
                    if (!oneRandomVideo) {
                        log('!oneRandomVideo', oneRandomVideo);
                        return;
                    }

                    const {firebaseUrl, id, sources} = oneRandomVideo;
                    const originalHashtags = sources.instagramReel?.originalHashtags || [];
                    log({accountsByScenario, scenario, randomVideoId: id});

                    if (!firebaseUrl) {
                        log('no firebase url');
                        return;
                    }
                    const bannerVideoUrlLocal = getRandomElementOfArray<string>(
                        scenario.extraBannerUrls,
                    );

                    if (!bannerVideoUrlLocal) {
                        log(
                            'no bannerVideoUrlLocal',
                            bannerVideoUrlLocal,
                            scenario.extraBannerUrls,
                        );
                        return;
                    }

                    await addBannerInTheEndUnique({
                        sourceId: id,
                        mainVideoUrl: firebaseUrl,
                        bannerVideoUrl: bannerVideoUrlLocal,
                        directoryName: id,
                        scenario,
                        originalHashtags,
                        accounts: accountsByScenario.map(({id: accountName}) => accountName),
                    });

                    if (scenario.onlyOnce) {
                        log('scenario.onlyOnce');
                        // update video.scenario with scenario name
                        // bad piece of code. because in case of errors only part of accounts will have prepared video.
                        // but basic video will never retry to prepared for rest of accounts
                        await regScenarioUsage(oneRandomVideo, scenario.name);
                    }
                } catch (error: unknown) {
                    logError(String(error));
                }
            }
        }
    } catch (error) {
        logError(error);
        console.log(error);
    }
};

export const runScenarioShortify = async () => {
    log('Started');
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        for (const scenario of scenarios) {
            if (!scenario) {
                log(['!scenario', scenario, scenarios]);
                return;
            }

            if (scenario.type !== 'ScenarioShortifyType') {
                log(['!scenario.type', scenario, scenarios]);
                continue;
            }

            log('run ScenarioShortify');

            const randomScenarioName = scenario.name;
            const accountsByScenario = accounts.filter((account) =>
                account.availableScenarios?.includes(randomScenarioName),
            );

            const oneRandomVideo = await getOneRandomVideo(scenario.name);
            if (!oneRandomVideo) {
                log('!oneRandomVideo', oneRandomVideo);
                return;
            }

            const {firebaseUrl, id, sources} = oneRandomVideo;
            const originalHashtags = sources.instagramReel?.originalHashtags || [];
            log({accountsByScenario, scenario, randomVideoId: id});

            if (!firebaseUrl) {
                console.log('no firebase url');
                return;
            }

            await shortify({
                sourceId: id,
                mainVideoUrl: firebaseUrl,
                bannerVideoUrls: scenario.extraBannerUrls,
                directoryName: id,
                scenario,
                originalHashtags,
                accounts: accountsByScenario.map(({id: accountName}) => accountName),
            });

            if (scenario.onlyOnce) {
                log('scenario.onlyOnce');
                // update video.scenario with scenario name
                await regScenarioUsage(oneRandomVideo, scenario.name);
            }
        }
    } catch (error) {
        logError(error);
    }
};

export const runScenarioShortifyUnique = async () => {
    log('Started');
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        let oneRandomVideo; // Video shared across accounts in this run

        for (const account of accounts) {
            const accountScenarios = account.availableScenarios || [];
            for (const accountScenario of accountScenarios) {
                try {
                    const scenario = scenarios.find(({name}) => name === accountScenario);
                    if (!scenario) {
                        log(['!scenario', scenario, scenarios]);
                        return;
                    }

                    // Check for the unique shortify scenario type
                    if (scenario.type !== 'ScenarioShortifyUniqueType') {
                        continue;
                    }
                    log({scenario});

                    // Process for the current account only
                    const accountsByScenario = [account];

                    // Get a single random video for this run if not already fetched
                    if (!oneRandomVideo) {
                        oneRandomVideo = await getOneRandomVideo(scenario.name);
                    }
                    if (!oneRandomVideo) {
                        log('!oneRandomVideo', oneRandomVideo);
                        return;
                    }

                    const {firebaseUrl, id, sources} = oneRandomVideo;
                    const originalHashtags = sources.instagramReel?.originalHashtags || [];
                    log({accountsByScenario, scenario, randomVideoId: id});

                    if (!firebaseUrl) {
                        log('no firebase url');
                        return;
                    }

                    // Call the existing shortify function with parameters for a unique run
                    await shortify({
                        sourceId: id,
                        mainVideoUrl: firebaseUrl,
                        bannerVideoUrls: scenario.extraBannerUrls, // Pass the list of banners
                        directoryName: id,
                        scenario,
                        originalHashtags,
                        accounts: accountsByScenario.map(({id: accountName}) => accountName), // Pass only the current account
                    });

                    if (scenario.onlyOnce) {
                        log('scenario.onlyOnce');
                        // Register usage, noting the potential issue mentioned in the reference function
                        await regScenarioUsage(oneRandomVideo, scenario.name);
                    }
                    log('Finished');
                } catch (error: unknown) {
                    logError(String(error));
                }
            }
        }
    } catch (error) {
        logError(error);
        console.log(error);
    }
};

export const runScenarioCoverWithImage = async () => {
    log('Started');
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        for (const scenario of scenarios) {
            if (!scenario) {
                log(['!scenario', scenario, scenarios]);
                return;
            }

            if (scenario.type !== 'ScenarioCoverWithImageType') {
                log(['!scenario.type', scenario, scenarios]);
                continue;
            }

            log('run ScenarioShortify');

            const randomScenarioName = scenario.name;
            const accountsByScenario = accounts.filter((account) =>
                account.availableScenarios?.includes(randomScenarioName),
            );

            const oneRandomVideo = await getOneRandomVideo(scenario.name);
            if (!oneRandomVideo) {
                log('!oneRandomVideo', oneRandomVideo);
                return;
            }

            const {firebaseUrl, id, sources} = oneRandomVideo;
            const originalHashtags = sources.instagramReel?.originalHashtags || [];
            log({accountsByScenario, scenario, randomVideoId: id});

            if (!firebaseUrl) {
                console.log('no firebase url');
                return;
            }

            await coverWithImage({
                sourceId: id,
                mainVideoUrl: firebaseUrl,
                directoryName: id,
                scenario,
                originalHashtags,
                accounts: accountsByScenario.map(({id: accountName}) => accountName),
            });

            if (scenario.onlyOnce) {
                log('scenario.onlyOnce');
                // update video.scenario with scenario name
                await regScenarioUsage(oneRandomVideo, scenario.name);
            }
        }
    } catch (error) {
        logError(error);
    }
};

export const runScenarioCron = (ms: number) => {
    if (!process.env.ENABLE_RUN_SCENARIO_VIDEO) {
        log('runScenarioCron', 'blocked');
        return;
    }
    log('runScenarioCron', 'started in', ms, 'ms');
    setTimeout(async () => {
        await runScenarioAddBannerAtTheEnd();
        await runScenarioAddBannerAtTheEndUnique();
        await runScenarioShortify();
        await runScenarioShortifyUnique();
        await runScenarioCoverWithImage();
        runScenarioCron(DelayMS.Min1);
    }, ms);
};
