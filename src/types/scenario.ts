export type ScenarioBase = {
    id: string;
    name: ScenarioName;
    onlyOnce: boolean;
    enabled: boolean;
};

export enum ScenarioName {
    ScenarioAddBannerAtTheEnd1 = 'add-banner-at-the-end-1',
}

export type ScenarioAddBannerAtTheEnd = {
    extraBannerUrl: string;
};
