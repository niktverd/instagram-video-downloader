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

import {firestore} from '#config/firebase';
import {Collection, DelayMS, MediaPostModelFilters, OrderDirection} from '#src/constants';
import {MediaPostModel} from '#types';
import {getWorkingDirectoryForVideo, log, logError, saveFileToDisk} from '#utils';
import {downloadVideoCron} from '$/chore/components/preprocess-video';
import {splitVideoInTheMiddle, testPIP} from '$/cloud-run/components/scenarios';
import {
    addSilentAudioStream,
    createVideoOfFrame,
    normalizeVideo,
} from '$/cloud-run/components/video';
import {uploadFileToServer} from '$/shared';

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

export const uiCreateVideoByScenario = async (_req: Request, res: Response) => {
    res.status(200).send({message: ' uiCreateVideoByScenario started'});
};

export const uiDownloadVideoFromSourceV3 = async (_req: Request, res: Response) => {
    res.status(200).send({message: 'uiDownloadVideoFromSourceV3 started'});
    downloadVideoCron(DelayMS.Sec1, true);
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
