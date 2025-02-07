import {DelayMS} from '../../constants';
import {getAccounts, getOneRandomVideo, getScenarios, regScenarioUsage} from '../../firebase';
import {ScenarioName} from '../../types/scenario';

import {addBannerInTheEnd} from './AddBannerInTheEnd';

export const runScenario = async () => {
    try {
        const accounts = await getAccounts(true);
        const scenarios = await getScenarios(true);

        const accountsByScenario = accounts.filter((account) =>
            account.availableScenarios?.includes(ScenarioName.ScenarioAddBannerAtTheEnd1),
        );

        const scenario = scenarios.find(
            ({name}) => name === (ScenarioName.ScenarioAddBannerAtTheEnd1 as string),
        );
        if (!scenario) {
            console.log(JSON.stringify(['!scenario', scenario, scenarios]));
            return;
        }
        console.log(JSON.stringify(scenario));

        const oneRandomVideo = await getOneRandomVideo(scenario.name);
        if (!oneRandomVideo) {
            console.log('!oneRandomVideo', JSON.stringify(oneRandomVideo));
            return;
        }

        const {firebaseUrl, id, sources} = oneRandomVideo;
        const title = sources.instagramReel?.title || '';
        const originalHashtags = sources.instagramReel?.originalHashtags || [];

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
            console.log('scenario.onlyOnce');
            // update video.scenario with scenario name
            await regScenarioUsage(oneRandomVideo, scenario.name);
        }
    } catch (error) {
        console.log(error);
        console.log(JSON.stringify(error));
    }
};

export const runScenarioCron = (ms: number) => {
    if (!process.env.ENABLE_RUN_SCENARIO_VIDEO) {
        console.log('runScenarioCron', 'blocked');
        return;
    }
    console.log('runScenarioCron', 'started in', ms, 'ms');
    setTimeout(() => {
        runScenario();
        runScenarioCron(DelayMS.Min5);
    }, ms);
};
