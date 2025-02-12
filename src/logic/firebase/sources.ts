import {
    DocumentData,
    DocumentSnapshot,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from 'firebase/firestore/lite';

import {firestore} from '../../config/firebase';
import {Collection} from '../../constants';
import {SourceV3} from '../../types';
import {log} from '../../utils';

export const getNRandomSources = async (limitVideo: number) => {
    if (limitVideo < 1) {
        throw new Error('limitVideo is to small');
    }

    const colRef = collection(firestore, Collection.Sources);
    let q = query(colRef, limit(1), orderBy('lastUsed', 'asc'), where('firebaseUrl', '!=', ''));

    const videoUrls: string[] = [];
    const sourceRefs: {
        ref: DocumentSnapshot<DocumentData, DocumentData>['ref'];
        timesUsed: number;
    }[] = [];

    while (videoUrls.length < limitVideo) {
        const randomValue = Math.random();
        const selectorRandomValue = Math.random();
        q = query(
            q,
            where('timesUsed', '<', 10),
            where('randomIndex', randomValue < selectorRandomValue ? '>=' : '<=', randomValue),
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            log({
                note: 'nothing was found',
                randomValue,
                selectorRandomValue,
            });
            continue;
        }
        const docSnap = snapshot.docs[0];
        const url = (docSnap.data() as SourceV3).firebaseUrl;
        if (!url) {
            log('not url', url);
            continue;
        }

        videoUrls.push(url);
        sourceRefs.push({ref: docSnap.ref, timesUsed: (docSnap.data() as SourceV3).timesUsed || 0});
    }

    return {videoUrls, sourceRefs};
};
