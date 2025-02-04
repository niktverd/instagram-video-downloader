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
import {Collection, MediaPostModelFilters, OrderDirection} from '../constants';
import {addScenario, patchScenario} from '../firebase';
import {MediaPostModel, ScenarioV3} from '../types';
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

    // console.log(JSON.stringify({docs}, null, 3));
    // console.log(JSON.stringify({'docsnap.size': docsnap.size, limitLocal}, null, 3));

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
        console.log(error);
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
        console.log(error);
        res.status(500).send(error);
    }
};

export const uiGetScenarios = async (_req: Request, res: Response) => {
    try {
        const collectionRef = collection(firestore, Collection.Scenarios);
        const snaps = await getDocs(collectionRef);
        if (snaps.empty) {
            throw new Error(`Collection ${Collection.Scenarios} is empty`);
        }
        const data = snaps.docs.map((snap) => ({...snap.data(), id: snap.id} as ScenarioV3));

        console.log(JSON.stringify({data}));
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
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
