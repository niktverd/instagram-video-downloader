/* eslint-disable @typescript-eslint/no-explicit-any */
export type SourceInstagramReel = {
    url: string;
    senderId: string;
    owner: string;
    title: string;
    originalHashtags: string[];
};

export type SourceYoutubeShort = {
    url: string;
};

export type Sources = {
    instagramReel?: SourceInstagramReel;
    youtubeShort?: SourceYoutubeShort;
};

type PublishedCommon = {
    published: boolean;
};

type ReportInstagramReel = PublishedCommon & {
    mediaContainerId?: string;
    status: 'empty' | 'uploaded' | 'finished' | 'published';
};

type ReportYoutubeShort = PublishedCommon & {
    videoId?: string;
};

export type MediaPostModel = {
    id: string;
    createdAt: any;
    firebaseUrl: string;
    sources: Sources;
    publishedOnInstagramCarcarKz: ReportInstagramReel;
    publishedOnInstagramCarcarTech: ReportInstagramReel;
    publishedOnYoutubeCarcentreKz: ReportYoutubeShort;
    attempt: number;
    randomIndex: number;
};

export type MediaPostModelOld = {
    id: string;
    account: string;
    createdAt: any;
    firebaseUrl: string;
    mediaContainerId: string;
    senderId: string;
    status: string;
    type: string;
    url: string;
};

export type SourceV3 = {
    id: string;
    createdAt: any;
    firebaseUrl: string;
    sources: Sources;
    randomIndex: number;
    bodyJSONString: object;
    attempt: number;
    scenarios: string[];
    lastUsed: any;
    timesUsed: number;
    scenariosHasBeenCreated: [];
    sender?: string;
    recipient?: string;
};

export type PreparedVideoV3 = {
    id: string;
    firebaseUrl: string;
    scenarioSlug: string;
    sourceId: string;
    scenarioId: string;
    title: string;
    originalHashtags: string[];
    accounts: string[];
    accountsHasBeenUsed: string[];
    parameters?: unknown;
};

export type AccountV3 = {
    id: number;
    token: string;
    disabled: boolean;
    availableScenarios: string[];
    accountBackgrounMusic?: string;
};

export type AccountMediaContainerV3 = {
    id: string;
    mediaContainerId: string;
    createdAt: any;
    status: 'created' | 'published';
    preparedVideoId: string;
};

export * from './account';
export * from './scenario';
export * from './instagramMediaContainer';
export * from './instagramLocation';
export * from './source';
export * from './preparedVideo';
export * from './user';
export * from './enums';
export * from './cloudRunScenarioExecution';
