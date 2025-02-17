import {DelayMS} from '../../constants';
import {log, logError} from '../../utils/logging';
import {getAccounts} from '../firebase/accounts';
import {getOneRandomVideo} from '../firebase/firebase';
import {getScenarios, regScenarioUsage} from '../firebase/scenarios';

import {addBannerInTheEnd} from './AddBannerInTheEnd';

export const runScenario = async () => {
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
        await runScenario();
        runScenarioCron(DelayMS.Min1);
    }, ms);
};
