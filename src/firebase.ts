import {addDoc, collection, deleteDoc, doc, getDocs, updateDoc} from 'firebase/firestore/lite';
import {deleteObject, ref} from 'firebase/storage';

import {firestore, storage} from './config/firebase';
import {Collection} from './constants';
import {MediaPostModelOld, ScenarioV3} from './types';

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

export const getScenarios = async () => {
    return [];
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
