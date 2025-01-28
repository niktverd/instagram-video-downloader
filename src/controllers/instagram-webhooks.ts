import dotenv from 'dotenv';
import {Request, Response} from 'express';
import {addDoc, collection} from 'firebase/firestore/lite';

import {firestore} from '../config/firebase';
import {Collection} from '../constants';
import {initiateRecord} from '../utils';

dotenv.config();

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);

const getAttachment = (body: Request['body']) => {
    const {object, entry: entries} = body;
    console.log(JSON.stringify(body));

    if (object !== 'instagram') {
        console.log(JSON.stringify({object}));
        throw new Error('Object is not instagram');
    }

    if (!entries?.length) {
        console.log(JSON.stringify({entries}));
        throw new Error('entries is empty');
    }

    const entry = entries[0];

    if (!entry) {
        console.log(JSON.stringify({entry}));
        throw new Error('entry is undefined');
    }

    if (!entry.messaging) {
        console.log(JSON.stringify({'entry.messaging': entry.messaging}));
        throw new Error('entry.messaging is undefined');
    }

    const [messaging] = entry.messaging;
    const senderId = messaging.sender?.id;
    console.log(JSON.stringify({senderId, messaging}));

    if (!availableSenders.includes(senderId?.toString())) {
        console.log(JSON.stringify({availableSenders, senderId}));
        throw new Error('senderId is not allowed');
    }

    const attachments = messaging.message?.attachments;
    if (!attachments.length) {
        console.log(JSON.stringify({attachments}));
        throw new Error('attachments is empty');
    }

    const [attachment] = attachments;
    if (!attachment) {
        console.log(JSON.stringify({attachment}));
        throw new Error('attachment is undefined');
    }

    return {senderId, attachment};
};

export const hubChallangeWebhook = (req: Request, res: Response) => {
    console.log(JSON.stringify(req.query));
    const hubChallenge = req.query['hub.challenge'];
    console.log(JSON.stringify(hubChallenge));

    res.status(200).send(hubChallenge);
};

export const messageWebhook = async (req: Request, res: Response) => {
    try {
        console.log(JSON.stringify(req.query));
        console.log(JSON.stringify(req.body?.entry?.length));

        const {senderId, attachment} = getAttachment(req.body);
        const {type, payload} = attachment;
        console.log(JSON.stringify({senderId, type, payload}));

        const {url, title = ''} = payload;
        const originalHashtags: string[] = title?.match(/#\w+/g) || [];

        const collectionRef = collection(firestore, Collection.MediaPosts);
        const firestoreDoc = await addDoc(
            collectionRef,
            initiateRecord({
                instagramReel: {
                    url,
                    senderId,
                    title,
                    originalHashtags,
                    owner: '',
                },
            }),
        );

        console.log('firestoreDoc', firestoreDoc.id);
        res.status(200).send('success');
    } catch (error) {
        console.log('Error: ', JSON.stringify(error));
        res.status(404).send('NotFound');
    }
};
