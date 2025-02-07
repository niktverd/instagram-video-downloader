import {shuffle} from 'lodash';

import {DelayMS} from '../../constants';
import {getAccounts, getOneRandomVideo, getScenarios, regScenarioUsage} from '../../firebase';
import {ScenarioName} from '../../types/scenario';
import {log, logError, logGroup} from '../logging';

import {addBannerInTheEnd} from './AddBannerInTheEnd';

export const runScenario = async () => {
    logGroup('open');
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        const randomScenario = shuffle([
            String(ScenarioName.ScenarioAddBannerAtTheEnd1),
            String(ScenarioName.ScenarioAddBannerAtTheEnd2),
        ])[0];

        const accountsByScenario = accounts.filter((account) =>
            account.availableScenarios?.includes(randomScenario),
        );

        const scenario = scenarios.find(({name}) => name === randomScenario);
        if (!scenario) {
            log(['!scenario', scenario, scenarios]);
            return;
        }
        log(scenario);

        const oneRandomVideo = await getOneRandomVideo(scenario.name);
        if (!oneRandomVideo) {
            log('!oneRandomVideo', oneRandomVideo);
            return;
        }

        const {firebaseUrl, id, sources} = oneRandomVideo;
        const title = sources.instagramReel?.title || '';
        const originalHashtags = sources.instagramReel?.originalHashtags || [];

        if (!firebaseUrl) {
            return;
        }

        await addBannerInTheEnd({
            mainVideoUrl: firebaseUrl,
            bannerVideoUrl: scenario.extraBannerUrl,
            directoryName: id,
            scenarioName: scenario.name,
            title,
            originalHashtags,
            accounts: accountsByScenario.map(({id: accountName}) => accountName),
        });

        if (scenario.onlyOnce) {
            log('scenario.onlyOnce');
            // update video.scenario with scenario name
            await regScenarioUsage(oneRandomVideo, scenario.name);
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
    setTimeout(() => {
        runScenario();
        runScenarioCron(DelayMS.Min5);
    }, ms);
    logGroup('close');
};
