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

import {firestore} from '#config/firebase';
import {Collection} from '#src/constants';
import {SourceV3} from '#types';
import {log} from '#utils';

export const getNRandomSources = async (limitVideo: number) => {
    if (limitVideo < 1) {
        throw new Error('limitVideo is to small');
    }

    const colRef = collection(firestore, Collection.Sources);

    const videoUrls: string[] = [];
    const sourceRefs: {
        ref: DocumentSnapshot<DocumentData, DocumentData>['ref'];
        timesUsed: number;
    }[] = [];
    const ids: string[] = [];
    let originalHashtags: string[] = [];

    const maxRetries = 100;
    let retry = 0;
    while (videoUrls.length < limitVideo) {
        if (retry++ > maxRetries) {
            break;
        }

        const randomValue = Math.random();
        const selectorRandomValue = Math.random();
        const q = query(
            colRef,
            orderBy('randomIndex', randomValue < selectorRandomValue ? 'asc' : 'desc'),
            where('firebaseUrl', '!=', ''),
            where('timesUsed', '<', 10),
            where('randomIndex', randomValue < selectorRandomValue ? '>=' : '<=', randomValue),
            limit(1),
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
        const docData = docSnap.data() as SourceV3;
        log({
            randomValue,
            selectorRandomValue,
            doc: docData.randomIndex,
            cond: randomValue < selectorRandomValue ? '>=' : '<=',
        });
        const url = docData.firebaseUrl;
        if (!url) {
            log('not url', url);
            continue;
        }

        videoUrls.push(url);
        sourceRefs.push({ref: docSnap.ref, timesUsed: docData.timesUsed || 0});
        ids.push(docSnap.id);
        originalHashtags = originalHashtags.concat(
            docData.sources.instagramReel?.originalHashtags || [],
        );
    }

    return {videoUrls, sourceRefs, ids, originalHashtags};
};
