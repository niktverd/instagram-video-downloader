import dotenv from 'dotenv';
import {Request, Response} from 'express';

import {createSource, wrapper} from '#src/db';
import {ApiFunctionPrototype} from '#src/types/common';
import {MessageWebhookV3Params, MessageWebhookV3Response} from '#src/types/instagramApi';
import {MessageWebhookV3Schema} from '#src/types/schemas/handlers';
import {ThrownError} from '#src/utils/error';
import {initiateRecordV3, log} from '#utils';

dotenv.config();

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);

const getAttachment = (body: Request['body']) => {
    const {object, entry: entries} = body;
    log(body);

    if (object !== 'instagram') {
        throw new ThrownError('Object is not instagram', 400);
    }

    if (!entries?.length) {
        throw new ThrownError('entries is empty', 400);
    }

    const entry = entries[0];

    if (!entry) {
        throw new ThrownError('entry is undefined', 400);
    }

    if (!entry.messaging) {
        throw new ThrownError('entry.messaging is undefined', 400);
    }

    const [messaging] = entry.messaging;
    const senderId = messaging.sender?.id;
    const recipientId = messaging.recipient?.id;

    if (!availableSenders.includes(senderId?.toString())) {
        throw new ThrownError(
            `senderId is not allowed, availableSenders: ${availableSenders.join(', ')}`,
            400,
        );
    }

    const attachments = messaging.message?.attachments;
    if (!attachments.length) {
        throw new ThrownError('attachments is empty', 400);
    }

    const [attachment] = attachments;
    if (!attachment) {
        throw new ThrownError('attachment is undefined', 400);
    }

    return {senderId, recipientId, attachment};
};

export const hubChallangeWebhook = (req: Request, res: Response) => {
    log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    log(hubChallenge);

    res.status(200).send(hubChallenge);
};

const messageWebhookV3: ApiFunctionPrototype<
    MessageWebhookV3Params,
    MessageWebhookV3Response
> = async (params, db) => {
    log('messageWebhookV3', 'params', params);
    const {senderId, recipientId, attachment} = getAttachment(params);
    const {type, payload} = attachment;
    log({senderId, type, payload});

    const {url, title = ''} = payload;
    const originalHashtags: string[] = title?.match(/#\w+/g) || [];

    const data = initiateRecordV3(
        {
            instagramReel: {
                url,
                senderId,
                title,
                originalHashtags,
                owner: '',
            },
        },
        params.body,
        senderId,
        recipientId,
    );

    const sourceRecord = await createSource(data, db);
    log('firestoreDoc', sourceRecord);

    return {
        result: {
            success: true,
            message: 'success',
        },
        code: 200,
    };
};

export const messageWebhookV3Post = wrapper<MessageWebhookV3Params, MessageWebhookV3Response>(
    messageWebhookV3,
    MessageWebhookV3Schema,
    'POST',
);
