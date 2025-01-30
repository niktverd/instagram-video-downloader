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
