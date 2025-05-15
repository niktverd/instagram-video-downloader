import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from 'firebase/firestore/lite';
import {deleteObject, ref} from 'firebase/storage';

import {firestore, storage} from '#config/firebase';
import {Collection} from '#src/constants';
import {ScenarioName} from '#src/types/enums';
import {AccountMediaContainerV3, MediaPostModelOld, SourceV3} from '#types';
import {log} from '#utils';

export const removePublished = async () => {
    const collectionRef = collection(firestore, 'media-post');
    const docSnaps = await getDocs(collectionRef);

    const documents = docSnaps.docs.map(
        (snap) => ({...snap.data(), id: snap.id} as unknown as MediaPostModelOld),
    );

    for (const document of documents) {
        log(document);
        const documentRef = doc(collectionRef, document.id);
        if (document.mediaContainerId && document.status === 'published') {
            const firebaseUrl = document.firebaseUrl;
            if (firebaseUrl) {
                const filePath = decodeURIComponent(firebaseUrl.split('/o/')[1].split('?')[0]);

                log(filePath); // Выведет: 0IG9JusjhjTRWX8Yd1G9.mp4
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
            }

            await deleteDoc(documentRef);
        }
    }
};

export const getOneRandomVideo = async (particularScenario?: ScenarioName) => {
    for (let i = 0; i < 10; i++) {
        const randomValue = Math.random();
        const selectorRandomValue = Math.random();
        const collectionRef = collection(firestore, Collection.Sources);
        let queryRef = query(
            collectionRef,
            orderBy('lastUsed', 'asc'),
            where('timesUsed', '<', 10),
            where('randomIndex', randomValue < selectorRandomValue ? '>=' : '<=', randomValue),
            limit(1),
        );

        if (particularScenario) {
            queryRef = query(queryRef, where('scenarios', 'array-contains', particularScenario));
        }

        const snapshot = await getDocs(queryRef);
        if (snapshot.empty) {
            log({
                note: 'nothing was found',
                randomValue,
                selectorRandomValue,
            });
            continue;
        }
        const docSnap = snapshot.docs[0];

        return {...docSnap.data(), id: docSnap.id} as SourceV3;
    }

    return null;
};

export const getRandomMediaContainersForAccount = async (accountName: string) => {
    const colRef = collection(
        firestore,
        Collection.Accounts,
        accountName,
        Collection.AccountMediaContainers,
    );

    const q = query(colRef, where('status', '==', 'created'));
    const snaps = await getDocs(q);
    const mediaContainers = snaps.docs.map(
        (snap) => ({...snap.data(), id: snap.id} as AccountMediaContainerV3),
    );

    return mediaContainers;
};
