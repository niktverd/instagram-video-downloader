import {Request, Response} from 'express';
import {
    collection,
    doc,
    getDocs,
    limit,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore/lite';

import {firestore} from '../config/firebase';
import {Collection, accessTokensArray} from '../constants';
import {removePublished} from '../firebase';
import {stopHerokuApp} from '../heroku';
import {findUnpublishedContainer, publishInstagramPostContainer} from '../instagram';
import {MediaPostModel} from '../types';
import {delay, getInstagramPropertyName, isTimeToPublishInstagram} from '../utils';

export const publishIntagram = async (req: Request, res: Response) => {
    console.log(req.query);

    await findUnpublishedContainer();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};

export const publishIntagram2 = async (req: Request, res: Response) => {
    console.log(req.query);

    try {
        await isTimeToPublishInstagram();
        // get random document for every account
        console.log('accessTokensArray', accessTokensArray);
        for (const accessTokenObject of accessTokensArray) {
            try {
                console.log(
                    JSON.stringify({
                        accessTokenId: accessTokenObject.id,
                        note: 'Publishing for account',
                    }),
                );
                const propertyName = getInstagramPropertyName(accessTokenObject.id);
                const randomValue = Math.random();
                const selectorRandomValue = Math.random();
                const collectionRef = collection(firestore, Collection.MediaPosts);
                const queryRef = query(
                    collectionRef,
                    where(
                        'randomIndex',
                        randomValue < selectorRandomValue ? '>=' : '<=',
                        randomValue,
                    ),
                    where(`${propertyName}.mediaContainerId`, '!=', '0'),
                    where(`${propertyName}.published`, '==', false),
                    limit(1),
                );
                const snapshot = await getDocs(queryRef);
                if (snapshot.empty) {
                    console.log(
                        JSON.stringify({
                            note: 'nothing was found',
                            propertyName,
                            randomValue,
                            selectorRandomValue,
                        }),
                    );
                    continue;
                }
                const docSnap = snapshot.docs[0];
                const docData = {...docSnap.data(), id: docSnap.id} as MediaPostModel;
                console.log({
                    note: 'doc was found',
                    propertyName,
                    randomValue,
                    docData,
                });

                // // check status of media container
                // // publish media container
                const result = await publishInstagramPostContainer({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    containerId: docData[propertyName].mediaContainerId!,
                    accessToken: accessTokenObject.token,
                });
                if (result?.success) {
                    await updateDoc(docSnap.ref, {
                        [`${propertyName}.published`]: true,
                        [`${propertyName}.status`]: 'published',
                    });
                    const systemCollectionRef = collection(firestore, Collection.System);
                    const scheduleDocRef = doc(systemCollectionRef, 'schedule');
                    await setDoc(scheduleDocRef, {lastPublishingTime: new Date()});
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                continue;
            }
        }
        // update record in db
        res.status(200).send('success');
    } catch (error) {
        console.log(error);
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
    }
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    console.log(req.query);

    await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};
