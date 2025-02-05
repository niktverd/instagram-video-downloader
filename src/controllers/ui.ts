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
import {addScenario, getScenarios, patchScenario} from '../firebase';
import {downloadVideo} from '../preprocess-video';
import {MediaPostModel} from '../types';
import {runScenario} from '../utils/scenarios';
import {splitVideoInTheMiddle, testPIP} from '../utils/video/splitVideoInTheMiddle';

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

        console.log(JSON.stringify({data}));
        res.status(200).send({
            status: 'ok',
        });

        await splitVideoInTheMiddle(data, snap.id);
    } catch (error) {
        console.log(JSON.stringify(error));
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

        console.log(JSON.stringify({data}));
        res.status(200).send({
            status: 'ok',
        });

        await testPIP(data, snap.id);
    } catch (error) {
        console.log(JSON.stringify(error));
        res.status(500).send(error);
    }
};

export const uiGetScenarios = async (_req: Request, res: Response) => {
    try {
        const scenarios = await getScenarios();
        res.status(200).send(scenarios);
    } catch (error) {
        console.log(JSON.stringify(error));
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
    await runScenario();
};

export const uiDownloadVideoFromSourceV3 = async (_req: Request, res: Response) => {
    res.status(200).send({message: 'uiDownloadVideoFromSourceV3 started'});
    downloadVideo(DelayMS.Sec1, true);
};
