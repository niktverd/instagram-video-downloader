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

import {
    canInstagramPostBePublished,
    createInstagramPostContainer,
    findUnpublishedContainer,
    prepareMediaContainersForAccount,
    publishInstagramPostContainer,
} from '../components';

import {firestore} from '#config/firebase';
import {
    getAccounts,
    getRandomMediaContainersForAccount,
    removePublished,
    stopHerokuApp,
} from '#logic';
import {Collection, accessTokensArray} from '#src/constants';
import {AccountMediaContainerV3, MediaPostModel} from '#types';
import {delay, getInstagramPropertyName, isTimeToPublishInstagram, log, logError} from '#utils';

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
    log(req.query);

    try {
        const accounts = await getAccounts(true);

        for (const account of accounts) {
            try {
                // get random document for every account
                // get 5 video
                const preparedContainers = await getRandomMediaContainersForAccount(account.id);
                log({account, preparedContainers});
                if (preparedContainers.length < 5) {
                    log('preparation for publishing');
                    // prepare 10 media containers
                    await prepareMediaContainersForAccount(account);
                }
                if (!preparedContainers.length) {
                    log('preparedContainers is empty');
                    continue;
                }

                // publish random container
                const randomContainer = shuffle(preparedContainers)[0];
                if (process.env.APP_ENV === 'dev') {
                    log('publishing is blocked in development');
                    continue;
                }

                const publishResponse = await publishInstagramPostContainer({
                    containerId: randomContainer.mediaContainerId,
                    accessToken: account.token,
                });

                log({publishResponse});
                log([Collection.Accounts, account.id, Collection.AccountMediaContainers]);

                if (publishResponse.success && !publishResponse.error) {
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
            } catch (error) {
                logError('trycatch for one cycle', error);
                console.log('error', error);
            }
        }

        // update record in db
        res.status(200).send('success');
    } catch (error) {
        logError('trycatch for entire publish process', error);
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
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

export const publishVideoFromUrl = async (req: Request, res: Response) => {
    try {
        log({body: req.body});
        const {videoUrl, caption, accessToken} = req.body;

        // Check if videoUrl and accessToken are provided
        if (!videoUrl || !accessToken) {
            res.status(400).json({
                success: false,
                error: 'Video URL and access token are required',
            });

            return;
        }

        // Create a container for the Instagram post
        const createContainerResponse = await createInstagramPostContainer({
            videoUrl,
            caption: caption || '', // Use provided caption or empty string
            accessToken,
        });

        if (!createContainerResponse.success || !createContainerResponse.mediaContainerId) {
            res.status(500).json({
                success: false,
                error: createContainerResponse.error || 'Failed to create media container',
            });

            return;
        }

        const mediaContainerId = createContainerResponse.mediaContainerId;

        res.status(200).json({
            success: true,
            message:
                'Media container created successfully. It can take up to 10 minutes to be ready. Please, be patient. Check your Instagram account to see the post later.',
        });

        // Check if the container is ready to be published with retries
        let isReady = false;
        const maxRetries = 10;
        const delayBetweenRetries = 10000; // 10 seconds in milliseconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            log(`Checking if container is ready (attempt ${attempt}/${maxRetries})`);

            isReady = await canInstagramPostBePublished({
                mediaContainerId,
                accessToken,
            });

            if (isReady) {
                log(`Container is ready to publish on attempt ${attempt}`);
                break;
            }

            if (attempt < maxRetries) {
                log(
                    `Container not ready, waiting ${
                        delayBetweenRetries / 1000
                    } seconds before retry...`,
                );
                await delay(delayBetweenRetries);
            }
        }

        if (!isReady) {
            return;
        }

        // Publish the container
        const publishResponse = await publishInstagramPostContainer({
            containerId: mediaContainerId,
            accessToken,
        });

        log({publishResponse});

        return;
    } catch (error: unknown) {
        logError(error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });

        return;
    }
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    log(req.query);

    await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};
