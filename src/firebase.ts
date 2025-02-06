import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore/lite';
import {deleteObject, ref} from 'firebase/storage';

import {firestore, storage} from './config/firebase';
import {Collection} from './constants';
import {AccountV3, MediaPostModelOld, ScenarioV3, SourceV3} from './types';
import {ScenarioName} from './types/scenario';

export const removePublished = async () => {
    const collectionRef = collection(firestore, 'media-post');
    const docSnaps = await getDocs(collectionRef);

    const documents = docSnaps.docs.map(
        (snap) => ({...snap.data(), id: snap.id} as unknown as MediaPostModelOld),
    );

    for (const document of documents) {
        console.log(JSON.stringify(document));
        const documentRef = doc(collectionRef, document.id);
        if (document.mediaContainerId && document.status === 'published') {
            const firebaseUrl = document.firebaseUrl;
            if (firebaseUrl) {
                const filePath = decodeURIComponent(firebaseUrl.split('/o/')[1].split('?')[0]);

                console.log(filePath); // Выведет: 0IG9JusjhjTRWX8Yd1G9.mp4
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef);
            }

            await deleteDoc(documentRef);
        }
    }
};

export const getScenarios = async (onlyEnabled = false) => {
    const collectionRef = collection(firestore, Collection.Scenarios);
    const snaps = await getDocs(collectionRef);
    if (snaps.empty) {
        throw new Error(`Collection ${Collection.Scenarios} is empty`);
    }
    const data = snaps.docs.map((snap) => ({...snap.data(), id: snap.id} as ScenarioV3));

    return data.filter(({enabled}) => (onlyEnabled ? enabled : true));
};

type PatchScenarioArgs = {
    id: string;
    values: ScenarioV3;
};

export const patchScenario = async ({id, values}: PatchScenarioArgs) => {
    const colRef = collection(firestore, Collection.Scenarios);
    const docRef = doc(colRef, id);
    await updateDoc(docRef, values);
};

type AddScenarioArgs = {
    id: string;
    values: ScenarioV3;
};

export const addScenario = async ({values}: AddScenarioArgs) => {
    const colRef = collection(firestore, Collection.Scenarios);
    await addDoc(colRef, values);
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
            console.log(
                JSON.stringify({
                    note: 'nothing was found',
                    randomValue,
                    selectorRandomValue,
                }),
            );
            continue;
        }
        const docSnap = snapshot.docs[0];

        return {...docSnap.data(), id: docSnap.id} as SourceV3;
    }

    return null;
};

export const regScenarioUsage = async (source: SourceV3, scenarioName: string) => {
    console.log(JSON.stringify({source, scenarioName}));
    if (!source || !scenarioName) {
        return;
    }

    const colRef = collection(firestore, Collection.Sources);
    const docRef = doc(colRef, source.id);
    await updateDoc(docRef, {
        scenarios: source.scenarios.filter((name) => name !== scenarioName),
    });
};

type AddAccountArgs = {
    id: string;
    values: AccountV3;
};

export const addAccount = async ({id, values}: AddAccountArgs) => {
    console.log('addAccount', {id, values});
    const docRef = doc(firestore, Collection.Accounts, id);
    const result = await setDoc(docRef, values);
    console.log(result);
};

export const patchAccount = async ({id, values}: AddAccountArgs) => {
    if (values.id !== id) {
        await addAccount({id, values: {...values, id, disabled: true}});
    }

    await addAccount({id: values.id, values});
};

export const getAccounts = async (onlyEnabled = false) => {
    const collectionRef = collection(firestore, Collection.Accounts);
    const snaps = await getDocs(collectionRef);
    if (snaps.empty) {
        throw new Error(`Collection ${Collection.Accounts} is empty`);
    }
    const data = snaps.docs.map((snap) => ({...snap.data(), id: snap.id} as ScenarioV3));

    return data.filter(({enabled}) => (onlyEnabled ? enabled : true));
};
