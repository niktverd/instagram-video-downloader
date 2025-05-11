import dotenv from 'dotenv';
import {Request, Response} from 'express';

import {createSource} from '#src/db';
import {initiateRecordV3, log, logError} from '#utils';

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
    const recipientId = messaging.recipient?.id;
    log({senderId, recipientId, messaging});

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

    return {senderId, recipientId, attachment};
};

export const hubChallangeWebhook = (req: Request, res: Response) => {
    log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    log(hubChallenge);

    res.status(200).send(hubChallenge);
};

export const messageWebhookV3 = async (req: Request, res: Response) => {
    try {
        log(req.query);
        log(req.body?.entry?.length);

        const {senderId, recipientId, attachment} = getAttachment(req.body);
        const {type, payload} = attachment;
        log({senderId, type, payload});

        const {url, title = ''} = payload;
        const originalHashtags: string[] = title?.match(/#\w+/g) || [];

        const data = await initiateRecordV3(
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
            senderId,
            recipientId,
        );

        console.log('before create source');
        const sourceRecord = await createSource(data);
        console.log('after create source');

        log('firestoreDoc', sourceRecord);
        res.status(200).send('success');
    } catch (error) {
        logError('Error: ', error);
        res.status(404).send('NotFound');
    }
};
