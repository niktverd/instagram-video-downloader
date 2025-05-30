import {readFileSync} from 'fs';

import {addDoc, collection} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {TransactionOrKnex} from 'objection';

import {firestore, storage} from '#config/firebase';
import {Collection} from '#src/constants';
import {getOnePreparedVideo} from '#src/db';
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

export const hasPreparedVideoBeenCreated = async (
    {
        accountId,
        scenarioId,
        sourceId,
    }: {
        accountId: number;
        scenarioId: number;
        sourceId: number;
    },
    db: TransactionOrKnex,
) => {
    try {
        log('Checking if prepared video exists:', {accountId, scenarioId, sourceId});
        const checkPreparedVideoExists = await getOnePreparedVideo(
            {
                scenarioId,
                accountId,
                sourceId,
            },
            db,
        );
        if (checkPreparedVideoExists) {
            log('Prepared video exists:', checkPreparedVideoExists);
            return true;
        }

        log('Prepared video does not exist');
        return false;
    } catch (error) {
        console.log(error);
        log('Error checking prepared video:', error);
        return false;
    }
};
