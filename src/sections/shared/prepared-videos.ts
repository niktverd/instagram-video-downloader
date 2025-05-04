import {readFileSync} from 'fs';

import {addDoc, collection, getDocs, query, where} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

import {firestore, storage} from '#config/firebase';
import {Collection} from '#src/constants';
import {PreparedVideoV3} from '#types';
import {log} from '#utils';

export const addPreparedVideo = async (args: Omit<PreparedVideoV3, 'id'>) => {
    log(args);
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

export const hasPreparedVideoBeenCreated = async ({
    accountId,
    scenarioId,
    sourceId,
}: {
    accountId: string;
    scenarioId: string;
    sourceId: string;
}) => {
    try {
        log('Checking if prepared video exists:', {accountId, scenarioId, sourceId});
        const collectionRef = collection(firestore, Collection.PreparedVideos);
        const q = query(
            collectionRef,
            where('sourceId', '==', sourceId),
            where('scenarioId', '==', scenarioId),
            where('accountsHasBeenUsed', 'array-contains', accountId),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            log('Prepared video exists:', querySnapshot.docs[0].data());
            return true;
        }

        log('Prepared video does not exist');
        return false;
    } catch (error) {
        log('Error checking prepared video:', error);
        return false;
    }
};
