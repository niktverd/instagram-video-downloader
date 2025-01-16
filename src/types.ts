import {Timestamp} from 'firebase/firestore/lite';

export type MediaPostModel = {
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
