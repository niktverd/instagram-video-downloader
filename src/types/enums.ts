export enum ScenarioName { // deprecated
    // ScenarioAddBannerAtTheEnd1 = 'add-banner-at-the-end-1',
    // ScenarioAddBannerAtTheEnd2 = 'add-banner-at-the-end-2',
    ScenarioAddBannerAtTheEndUnique = 'add-banner-at-the-end-unique',
    ScenarioShortifyUnique = 'shortify-unique',
    // ScenarioShortify = 'shortify',
}

export enum ScenarioType {
    // ScenarioAddBannerAtTheEnd = 'ScenarioAddBannerAtTheEnd',
    ScenarioAddBannerAtTheEndUnique = 'ScenarioAddBannerAtTheEndUnique',
    // ScenarioShortify = 'ScenarioShortify',
    ScenarioShortifyUnique = 'ScenarioShortifyUnique',
    // ScenarioCoverWithImage = 'ScenarioCoverWithImage',
    // ScenarioLongVideoWithInjections = 'ScenarioLongVideoWithInjections',
    ScenarioCoverWithGreenUnique = 'ScenarioCoverWithGreenUnique',
}

export enum InstagramLocationSource {
    Scenario = 'scenario',
    Account = 'account',
}

export enum CloudRunScenarioExecutionStatusEnum {
    InProgress = 'in-progress',
    Success = 'success',
    Fail = 'fail',
    Cancelled = 'cancelled',
    Timeout = 'timeout',
}
