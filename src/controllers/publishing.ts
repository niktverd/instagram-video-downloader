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
import {shuffle} from 'lodash';

import {firestore} from '../config/firebase';
import {Collection, accessTokensArray} from '../constants';
import {
    findUnpublishedContainer,
    getAccounts,
    getRandomMediaContainersForAccount,
    prepareMediaContainersForAccount,
    publishInstagramPostContainer,
    removePublished,
    stopHerokuApp,
} from '../logic';
import {AccountMediaContainerV3, MediaPostModel} from '../types';
import {delay, getInstagramPropertyName, isTimeToPublishInstagram, log, logGroup} from '../utils';

export const publishIntagram = async (req: Request, res: Response) => {
    log(req.query);

    await findUnpublishedContainer();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};

export const publishIntagram2 = async (req: Request, res: Response) => {
    log(req.query);

    try {
        await isTimeToPublishInstagram();
        // get random document for every account
        log('accessTokensArray', accessTokensArray);
        for (const accessTokenObject of accessTokensArray) {
            let propertyName: keyof MediaPostModel | null = null;
            let docRef: DocumentReference<DocumentData, DocumentData> | null = null;
            // let collectionRef: CollectionReference<DocumentData, DocumentData> | null = null;
            try {
                log({
                    accessTokenId: accessTokenObject.id,
                    note: 'Publishing for account',
                });
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
                    log({
                        note: 'nothing was found',
                        propertyName,
                        randomValue,
                        selectorRandomValue,
                    });
                    continue;
                }
                const docSnap = snapshot.docs[0];
                docRef = docSnap.ref;
                //  log(docRe2f);
                const docData = {...docSnap.data(), id: docSnap.id} as MediaPostModel;
                log({
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
                log(error);
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
        log(error);
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
    }
};

export const publishIntagramV3 = async (req: Request, res: Response) => {
    logGroup('open');
    log(req.query);

    try {
        const accounts = await getAccounts(true);

        for (const account of accounts) {
            // get random document for every account
            log('account', {account});
            // get 5 video
            const preparedContainers = await getRandomMediaContainersForAccount(account.id);
            log({account, preparedContainers});
            if (preparedContainers.length < 5) {
                // prepare 10 media containers
                await prepareMediaContainersForAccount(account);
            }
            if (!preparedContainers.length) {
                continue;
            }

            // publish random container
            const randomContainer = shuffle(preparedContainers)[0];
            if (process.env.APP_ENV !== 'development') {
                continue;
            }
            const publishResponse = await publishInstagramPostContainer({
                containerId: randomContainer.mediaContainerId,
                accessToken: account.token,
            });

            log({publishResponse});
            log([firestore, Collection.Accounts, account.id, Collection.AccountMediaContainers]);

            // update container data
            const docRef = doc(
                firestore,
                Collection.Accounts,
                account.id,
                Collection.AccountMediaContainers,
                randomContainer.id,
            );
            log({docRef});

            await updateDoc(docRef, {
                status: 'published',
            } as AccountMediaContainerV3);
        }

        // update record in db
        res.status(200).send('success');
    } catch (error) {
        log(error);
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
        logGroup('close');
    }
};

export const publishById = async (req: Request, res: Response) => {
    try {
        log({body: req.body});
        const {id, accessToken} = req.body;
        if (!id || !accessToken) {
            throw new Error('no id or accessToken found in body');
        }

        const result = await publishInstagramPostContainer({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            containerId: id,
            accessToken: accessToken,
        });
        log({result});
    } catch (error) {
        log(error);
    }
    res.status(200).send('published-by-id');
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    log(req.query);

    await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};
