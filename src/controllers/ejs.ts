import {Request, Response} from 'express';
import {collection, deleteDoc, doc, getDocs} from 'firebase/firestore/lite';

import {firestore} from '../config/firebase';
import {MediaPostModel} from '../types';

export const reportInterface = async (_req: Request, res: Response) => {
    const collectionRef = collection(firestore, 'media-post');
    const snaps = await getDocs(collectionRef);
    const docs = snaps.docs.map(
        (docEnt) => ({...docEnt.data(), id: docEnt.id} as unknown as MediaPostModel),
    );

    const published = docs.filter(({status}) => status === 'published');
    const notPublished = docs.filter(({status}) => status !== 'published');

    res.render('index', {total: docs.length, published, notPublished});
};

export const removePostById = async (req: Request, res: Response) => {
    const {id} = req.body;
    console.log(`Получен ID поста: ${id}`);
    if (!id) {
        res.status(200).send('ID получен успешно.');
        return;
    }

    const collectionRef = collection(firestore, 'media-post');
    const docRef = doc(collectionRef, id);
    deleteDoc(docRef);

    res.status(200).send('ID получен успешно.');
};
