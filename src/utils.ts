import {collection, doc, updateDoc} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

import {firestore, storage} from '../config/firebase';

type UploadFileFromUrlArgs = {
  url: string;
  firebaseId: string;
};

export async function uploadFileFromUrl({url, firebaseId}: UploadFileFromUrlArgs) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            responseType: 'arraybuffer',
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any);

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || undefined;

        const fileRef = ref(storage, `${firebaseId}.mp4`);

        const metadata = {contentType};
        await uploadBytes(fileRef, fileBuffer, metadata);

        const downloadURL = await getDownloadURL(fileRef);

        console.log('Файл успешно загружен:', downloadURL);

        const collectionRef = collection(firestore, 'media-post');
        const documentRef = doc(collectionRef, firebaseId);
        await updateDoc(documentRef, {
            firebaseUrl: downloadURL,
        });

        return downloadURL;
    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        throw error;
    }
}
