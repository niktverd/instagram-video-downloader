import {Timestamp} from 'firebase/firestore/lite';

import {ScenarioAddBannerAtTheEnd, ScenarioBase} from './scenario';

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
    createdAt: Timestamp;
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
    createdAt: Timestamp;
    firebaseUrl: string;
    mediaContainerId: string;
    senderId: string;
    status: string;
    type: string;
    url: string;
};

export type SourceV3 = {
    id: string;
    createdAt: Timestamp;
    firebaseUrl: string;
    sources: Sources;
    randomIndex: number;
    bodyJSONString: string;
    attempt: number;
    scenarios: string[];
};

export type ScenarioV3 = ScenarioBase & ScenarioAddBannerAtTheEnd;
