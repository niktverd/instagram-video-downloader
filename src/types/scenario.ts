export type ScenarioBase = {
    id: string;
    name: ScenarioName;
    onlyOnce: boolean;
    enabled: boolean;
    texts: Record<string, string[]>;
};

export enum ScenarioName {
    ScenarioAddBannerAtTheEnd1 = 'add-banner-at-the-end-1',
    ScenarioAddBannerAtTheEnd2 = 'add-banner-at-the-end-2',
    ScenarioAddBannerAtTheEndUnique = 'add-banner-at-the-end-unique',
    ScenarioShortifyUnique = 'shortify-unique',
    ScenarioShortify = 'shortify',
}

export type ScenarioAddBannerAtTheEnd = {
    type: 'ScenarioAddBannerAtTheEnd';
    extraBannerUrl: string;
};

export type ScenarioAddBannerAtTheEndUnique = {
    type: 'ScenarioAddBannerAtTheEndUnique';
    extraBannerUrl?: string;
    extraBannerUrls: string[];
};

export type ScenarioShortify = {
    type: 'ScenarioShortifyType';
    extraBannerUrls: string[];
    minDuration: number;
    maxDuration: number;
};

export type ScenarioShortifyUnique = {
    type: 'ScenarioShortifyUniqueType';
    minDuration: number;
    maxDuration: number;
    extraBannerUrls: string[];
};

export type ScenarioCoverWithImage = {
    type: 'ScenarioCoverWithImageType';
    imageUrl: string;
    imageTop: number;
    imageLeft: number;
    imageWidth: number;
    imageHeight: number;
    videoTop: number;
    videoLeft: number;
    videoWidth: number;
    videoHeight: number;
};

export type ScenarioLongVideoWithInjections = {
    type: 'ScenarioLongVideoWithInjections';
    adsBannerUrl: string;
    startBannerUrl: string;
    injections: string[];
    limit: number;
};
