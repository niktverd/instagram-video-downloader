import {Request, Response} from 'express';
import {
    DocumentData,
    DocumentReference,
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
    console.log(JSON.stringify(req.query));

    await findUnpublishedContainer();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};

export const publishIntagram2 = async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.query));

    try {
        await isTimeToPublishInstagram();
        // get random document for every account
        console.log('accessTokensArray', JSON.stringify(accessTokensArray));
        for (const accessTokenObject of accessTokensArray) {
            let propertyName: keyof MediaPostModel | null = null;
            let docRef: DocumentReference<DocumentData, DocumentData> | null = null;
            // let collectionRef: CollectionReference<DocumentData, DocumentData> | null = null;
            try {
                console.log(
                    JSON.stringify({
                        accessTokenId: accessTokenObject.id,
                        note: 'Publishing for account',
                    }),
                );
                propertyName = getInstagramPropertyName(accessTokenObject.id);
                if (!propertyName) {
                    throw new Error(`No propertyName: ${propertyName}`);
                }
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
                    where(`${propertyName}.mediaContainerId`, '!=', ''),
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
                docRef = docSnap.ref;
                // console.log(docRe2f);
                const docData = {...docSnap.data(), id: docSnap.id} as MediaPostModel;
                console.log(
                    JSON.stringify({
                        note: 'doc was found',
                        propertyName,
                        randomValue,
                        docData,
                    }),
                );

                // // check status of media container
                // // publish media container
                const result = await publishInstagramPostContainer({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    containerId: docData[propertyName].mediaContainerId!,
                    accessToken: accessTokenObject.token,
                });
                if (result?.success) {
                    await updateDoc(docRef, {
                        [`${propertyName}.error`]: false,
                        [`${propertyName}.published`]: true,
                        [`${propertyName}.status`]: 'published',
                    });
                    const systemCollectionRef = collection(firestore, Collection.System);
                    const scheduleDocRef = doc(systemCollectionRef, 'schedule');
                    await setDoc(scheduleDocRef, {lastPublishingTime: new Date()});
                }
            } catch (error) {
                console.log(JSON.stringify(error));
                if (docRef) {
                    await updateDoc(docRef, {
                        [`${propertyName}.error`]: true,
                        [`${propertyName}.errorText`]: JSON.stringify(error),
                    });
                }
                continue;
            }
        }
        // update record in db
        res.status(200).send('success');
    } catch (error) {
        console.log(JSON.stringify(error));
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
    }
};

export const publishById = async (req: Request, res: Response) => {
    try {
        console.log(JSON.stringify({body: req.body}));
        const {id, accessToken} = req.body;
        if (!id || !accessToken) {
            throw new Error('no id or accessToken found in body');
        }

        const result = await publishInstagramPostContainer({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            containerId: id,
            accessToken: accessToken,
        });
        console.log({result});
    } catch (error) {
        console.log(JSON.stringify(error));
    }
    res.status(200).send('published-by-id');
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.query));

    await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};
