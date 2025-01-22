import {collection, deleteDoc, doc, getDocs} from 'firebase/firestore/lite';
import {deleteObject, ref} from 'firebase/storage';

import {firestore, storage} from './config/firebase';
import {MediaPostModelOld} from './types';

export const removePublished = async () => {
    const collectionRef = collection(firestore, 'media-post');
    const docSnaps = await getDocs(collectionRef);

    const documents = docSnaps.docs.map(
        (snap) => ({...snap.data(), id: snap.id} as unknown as MediaPostModelOld),
    );

    for (const document of documents) {
        console.log(document);
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
