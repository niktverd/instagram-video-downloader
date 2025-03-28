import {rmSync} from 'fs';
import {join} from 'path';

import {Request, Response} from 'express';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
} from 'firebase/firestore/lite';
import {pick} from 'lodash';

import {firestore} from '../config/firebase';
import {Collection, DelayMS, MediaPostModelFilters, OrderDirection} from '../constants';
import {
    addAccount,
    addScenario,
    addSilentAudioStream,
    clearPreprod,
    createVideoOfFrame,
    downloadVideoCron,
    getAccounts,
    getInstagramInsights,
    getInstagramMedia,
    getInstagramUserNameById,
    getScenarios,
    getVideoOwnerByVideoId,
    normalizeVideo,
    patchAccount,
    patchScenario,
    runInjectionScenraios,
    runScenarioAddBannerAtTheEnd,
    splitVideoInTheMiddle,
    testPIP,
    uploadFileToServer,
} from '../logic';
import {MediaPostModel} from '../types';
import {getWorkingDirectoryForVideo, log, logError, saveFileToDisk} from '../utils';

export const uiGetMediaPosts = async (req: Request, res: Response) => {
    const {
        limit: limitLocal = 5,
        orderByField = MediaPostModelFilters.CreatedAt,
        orderDirection = OrderDirection.Desc,
        lastDocumentId,
    } = req.query;
    const collectionRef = collection(firestore, Collection.MediaPosts);
    let q = query(
        collectionRef,
        orderBy(orderByField as string, orderDirection === OrderDirection.Asc ? 'asc' : 'desc'),
    );

    if (lastDocumentId && typeof lastDocumentId === 'string') {
        const lstDocRef = doc(collectionRef, lastDocumentId);
        const lastDocSnap = await getDoc(lstDocRef);
        q = query(q, startAfter(lastDocSnap));
    }

    q = query(q, limit(Number(limitLocal)));

    const docsnap = await getDocs(q);

    const docs = docsnap.docs.map((docSnap) => ({
        // ...docSnap.data(),
        ...pick(docSnap.data(), 'sources'),
        id: docSnap.id,
    }));

    res.status(200).send({
        mediaPosts: docs,
        lastDocumentId: docs.length ? docs[docs.length - 1].id : null,
        hasMore: docsnap.size === Number(limitLocal),
    });
};

export const uiSplitVideoInTheMiddle = async (req: Request, res: Response) => {
    try {
        const {id} = req.body;
        if (!id) {
            throw new Error('id was not provided');
        }

        const collectionRef = collection(firestore, Collection.MediaPosts);
        const docRef = doc(collectionRef, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            throw new Error(`Document with id ${id} does not exist`);
        }
        const data = snap.data() as MediaPostModel;

        log({data});
        res.status(200).send({
            status: 'ok',
        });

        await splitVideoInTheMiddle(data, snap.id);
    } catch (error) {
        logError(error);
        res.status(500).send(error);
    }
};

export const uiTestGreenScreen = async (req: Request, res: Response) => {
    try {
        const {id} = req.body;
        if (!id) {
            throw new Error('id was not provided');
        }

        const collectionRef = collection(firestore, Collection.MediaPosts);
        const docRef = doc(collectionRef, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            throw new Error(`Document with id ${id} does not exist`);
        }
        const data = snap.data() as MediaPostModel;

        log({data});
        res.status(200).send({
            status: 'ok',
        });

        await testPIP(data, snap.id);
    } catch (error) {
        log(error);
        res.status(500).send(error);
    }
};

export const uiGetScenarios = async (_req: Request, res: Response) => {
    try {
        const scenarios = await getScenarios();
        res.status(200).send(scenarios);
    } catch (error) {
        logError(error);
        res.status(500).send(error);
    }
};

export const uiPatchScenario = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    await patchScenario({id, values});
    res.status(200).send(req.body);
};

export const uiAddScenario = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    await addScenario({id, values});
    res.status(200).send(req.body);
};

export const uiCreateVideoByScenario = async (_req: Request, res: Response) => {
    res.status(200).send({message: ' uiCreateVideoByScenario started'});
    await runScenarioAddBannerAtTheEnd();
};

export const uiDownloadVideoFromSourceV3 = async (_req: Request, res: Response) => {
    res.status(200).send({message: 'uiDownloadVideoFromSourceV3 started'});
    downloadVideoCron(DelayMS.Sec1, true);
};

export const uiGetAccounts = async (_req: Request, res: Response) => {
    try {
        const accounts = await getAccounts();
        log(accounts);
        res.status(200).send(accounts);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInsights = async (req: Request, res: Response) => {
    const {id: accountName} = req.query;

    try {
        if (!accountName) {
            throw new Error('accoutn name is not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const insight = await getInstagramInsights(account.token);

        log(insight);
        res.status(200).send(insight);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramUserById = async (req: Request, res: Response) => {
    const {id: accountName, userId} = req.query;

    try {
        if (!accountName || !userId) {
            throw new Error('accoutn name or userId are not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const user = await getInstagramUserNameById(userId as string, account.token);

        log(user);
        res.status(200).send(user);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramUserIdByMediaId = async (req: Request, res: Response) => {
    const {id: accountName, reelVideoId} = req.query;

    try {
        if (!accountName || !reelVideoId) {
            throw new Error('accoutn name or reelVideoId are not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const owner = await getVideoOwnerByVideoId({
            reelVideoId: reelVideoId as string,
            accessToken: account.token,
        });

        log(owner);
        res.status(200).send(owner);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramMedia = async (req: Request, res: Response) => {
    const {id: accountName} = req.query;

    try {
        if (!accountName) {
            throw new Error('accoutn name is not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const media = await getInstagramMedia(account.token);

        log(media);
        res.status(200).send(media);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiAddAccount = async (req: Request, res: Response) => {
    const {
        values: {id, token, availableScenarios},
    } = req.body;
    log(req.body, {id, values: {id, token, availableScenarios}});
    await addAccount({id, values: {id, token, disabled: false, availableScenarios}});
    res.status(200).send(req.body);
};

export const uiPatchAccount = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    log(values);
    await patchAccount({id, values});
    res.status(200).send(req.body);
};

export const uiClearPreprod = async (req: Request, res: Response) => {
    await clearPreprod();
    res.status(200).send(req.query);
};

export const uiRunInjectionScenraios = async (req: Request, res: Response) => {
    res.status(200).send(req.query);
    await runInjectionScenraios();
};

export const uiConvertImageToVideo = async (req: Request, res: Response) => {
    const {imageUrl, duration, pathToSave = ''} = req.body;
    if (!imageUrl || !duration) {
        res.status(400).send({message: 'if (!imageUrl || !duration) {'});
        return;
    }
    if (!imageUrl.includes('.jpeg') && !imageUrl.includes('.jpg') && !imageUrl.includes('.png')) {
        res.status(400).send({message: 'not image'});
        return;
    }

    const randomName = Math.random().toString();
    const basePath = getWorkingDirectoryForVideo(randomName);

    //download videos
    const temp1 = join(basePath, `frame.img`);

    const imagePath = await saveFileToDisk(imageUrl, temp1);

    const videoFile = await createVideoOfFrame({input: imagePath, duration});
    const withAudio = await addSilentAudioStream({input: videoFile});
    const normalized = await normalizeVideo(withAudio);
    console.log({normalized});
    const downloadURL = await uploadFileToServer(normalized, `${pathToSave}${randomName}.mp4`);

    // delete tempfiles
    rmSync(basePath, {recursive: true});

    res.status(200).send({path: downloadURL});
};
