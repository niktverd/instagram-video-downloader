import {readFileSync} from 'fs';

import {addDoc, collection} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

import {firestore, storage} from '../../config/firebase';
import {Collection} from '../../constants';
import {PreparedVideoV3} from '../../types';
import {log} from '../../utils/logging';

export const addPreparedVideo = async (args: Omit<PreparedVideoV3, 'id'>) => {
    const colRef = collection(firestore, Collection.PreparedVideos);
    await addDoc(colRef, args as Omit<PreparedVideoV3, 'id'>);
};

export const uploadFileToServer = async (outputFilePath: string, uploadFileName: string) => {
    log({outputFilePath, uploadFileName});
    const processedBuffer = readFileSync(outputFilePath);
    const fileRef = ref(storage, uploadFileName);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);
    const downloadURL = await getDownloadURL(fileRef);
    log('downloadURL', downloadURL);

    return downloadURL;
};
