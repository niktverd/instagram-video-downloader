import dotenv from 'dotenv';
import {Request, Response} from 'express';
import {addDoc, collection} from 'firebase/firestore/lite';

import {firestore} from '../config/firebase';
import {createInstagramPostContainer, getMergedVideo} from '../instagram';
import {preparePostText} from '../utils';

dotenv.config();

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);
const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]');

const SECOND_VIDEO =
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2F0116.mp4?alt=media&token=60b0b84c-cd07-4504-9a6f-a6a44ea73ec4';

export const hubChallangeWebhook = (req: Request, res: Response) => {
    console.log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    console.log(hubChallenge);

    res.status(200).send(hubChallenge);
};

export const messageWebhook = async (req: Request, res: Response) => {
    console.log(req.query);
    console.log(JSON.stringify(req.body?.entry?.length, null, 3));

    const {object, entry: entries} = req.body;

    console.log(JSON.stringify(req.body));

    if (object !== 'instagram') {
        res.status(404).send('NotFound');
        return;
    }

    if (entries?.length) {
        const entry = req.body.entry[0];
        if (!entry) {
            res.status(404).send('NotFound');
            return;
        }

        if (!entry.messaging) {
            res.status(404).send('NotFound');
            return;
        }

        const [messaging] = entry.messaging;

        console.log('messaging', messaging);

        const senderId = messaging.sender?.id;
        if (!availableSenders.includes(senderId?.toString())) {
            console.log({availableSenders, senderId});
            res.status(404).send('NotFound');
            return;
        }

        const attachments = messaging.message?.attachments;
        if (!attachments.length) {
            res.status(404).send('NotFound');
            return;
        }

        const accessTokenObject =
            accessTokensArray[Math.floor(Math.random() * accessTokensArray.length)];

        for (const attachment of attachments) {
            const {type, payload} = attachment;
            console.log({senderId, type, payload});
            const {url, title} = payload;
            const originalHashtags: string[] = title?.match(/#\w+/g) || [];

            console.log(originalHashtags);
            const caption = preparePostText(originalHashtags);

            const collectionRef = collection(firestore, 'media-post');
            const firestoreDoc = await addDoc(collectionRef, {
                createdAt: new Date(),
                url,
                senderId,
                type,
                account: accessTokenObject.id,
            });

            console.log('firestoreDoc', firestoreDoc.id);

            const urlToPublish = await getMergedVideo({
                videoUrl: url,
                finalVideoUrl: SECOND_VIDEO,
                firebaseId: firestoreDoc.id,
            });

            console.log({urlToPublish});

            await createInstagramPostContainer({
                videoUrl: urlToPublish,
                caption:
                    caption ||
                    'Оптовые цены на запчасти и расходники для авто для наших подписчиков (пока только в Астане). Пишите в директ, какая запчасть или какое масло вы ищите и мы предоставим вам лучшие цены с оптовых складов. Присылайте ссылку на свой профиль, чтобы мы убедились, что вы наш подписчик.',
                accessToken: accessTokenObject.token,
                firebaseId: firestoreDoc.id,
            });
        }
    }

    res.status(200).send('success');
};
