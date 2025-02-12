import {DelayMS} from '../../constants';
import {log, logError, logGroup} from '../../utils/logging';
import {getAccounts} from '../firebase/accounts';
import {getOneRandomVideo} from '../firebase/firebase';
import {getScenarios, regScenarioUsage} from '../firebase/scenarios';

import {addBannerInTheEnd} from './AddBannerInTheEnd';

export const runScenario = async () => {
    logGroup('open');
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        for (const scenario of scenarios) {
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
            const title = sources.instagramReel?.title || '';
            const originalHashtags = sources.instagramReel?.originalHashtags || [];
            log({accountsByScenario, scenario, randomVideoId: id});

            if (!firebaseUrl) {
                return;
            }

            await addBannerInTheEnd({
                sourceId: id,
                mainVideoUrl: firebaseUrl,
                bannerVideoUrl: scenario.extraBannerUrl,
                directoryName: id,
                scenarioName: scenario.name,
                scenarioId: scenario.id,
                title,
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
    } finally {
        logGroup('close');
    }
};

export const runScenarioCron = (ms: number) => {
    logGroup('open');
    if (!process.env.ENABLE_RUN_SCENARIO_VIDEO) {
        log('runScenarioCron', 'blocked');
        logGroup('close');
        return;
    }
    log('runScenarioCron', 'started in', ms, 'ms');
    setTimeout(async () => {
        await runScenario();
        runScenarioCron(DelayMS.Min1);
    }, ms);
    logGroup('close');
};
