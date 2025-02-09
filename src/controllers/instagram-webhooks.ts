import dotenv from 'dotenv';
import {Request, Response} from 'express';
import {addDoc, collection} from 'firebase/firestore/lite';

import {firestore} from '../config/firebase';
import {Collection} from '../constants';
import {initiateRecordV3} from '../utils/common';
import {log, logError, logGroup} from '../utils/logging';

dotenv.config();

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);

const getAttachment = (body: Request['body']) => {
    const {object, entry: entries} = body;
    log(body);

    if (object !== 'instagram') {
        log({object});
        throw new Error('Object is not instagram');
    }

    if (!entries?.length) {
        log({entries});
        throw new Error('entries is empty');
    }

    const entry = entries[0];

    if (!entry) {
        log({entry});
        throw new Error('entry is undefined');
    }

    if (!entry.messaging) {
        log({'entry.messaging': entry.messaging});
        throw new Error('entry.messaging is undefined');
    }

    const [messaging] = entry.messaging;
    const senderId = messaging.sender?.id;
    log({senderId, messaging});

    if (!availableSenders.includes(senderId?.toString())) {
        log({availableSenders, senderId});
        throw new Error('senderId is not allowed');
    }

    const attachments = messaging.message?.attachments;
    if (!attachments.length) {
        log({attachments});
        throw new Error('attachments is empty');
    }

    const [attachment] = attachments;
    if (!attachment) {
        log({attachment});
        throw new Error('attachment is undefined');
    }

    return {senderId, attachment};
};

export const hubChallangeWebhook = (req: Request, res: Response) => {
    log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    log(hubChallenge);

    res.status(200).send(hubChallenge);
};

export const messageWebhookV3 = async (req: Request, res: Response) => {
    logGroup('open');
    try {
        log(req.query);
        log(req.body?.entry?.length);

        const {senderId, attachment} = getAttachment(req.body);
        const {type, payload} = attachment;
        log({senderId, type, payload});

        const {url, title = ''} = payload;
        const originalHashtags: string[] = title?.match(/#\w+/g) || [];

        const collectionRef = collection(firestore, Collection.Sources);
        const firestoreDoc = await addDoc(
            collectionRef,
            await initiateRecordV3(
                {
                    instagramReel: {
                        url,
                        senderId,
                        title,
                        originalHashtags,
                        owner: '',
                    },
                },
                req.body,
            ),
        );

        log('firestoreDoc', firestoreDoc.id);
        res.status(200).send('success');
    } catch (error) {
        logError('Error: ', error);
        res.status(404).send('NotFound');
    } finally {
        logGroup('close');
    }
};
