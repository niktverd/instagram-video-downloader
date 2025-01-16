import dotenv from 'dotenv';
import express from 'express';
import {addDoc, collection, deleteDoc, doc, getDocs} from 'firebase/firestore/lite';
import qs from 'qs';

import {firestore} from './config/firebase';
import {stopHerokuApp} from './src/heroku';
import {createInstagramPostContainer, findUnpublishedContainer} from './src/publishPost';
import {MediaPostModel} from './src/types';
import {uploadFileFromUrl} from './src/utils';
// const cron = require('node-cron');
dotenv.config();

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);
const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]');

// Add this delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.set('query parser', function (str) {
    return qs.parse(str, {
        /* custom options */
    });
});
app.set('view engine', 'ejs');

app.get('/webhooks', (req, res) => {
    console.log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    console.log(hubChallenge);

    res.status(200).send(hubChallenge);
});

app.post('/webhooks', async (req, res) => {
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
            const {url} = payload;

            const collectionRef = collection(firestore, 'media-post');
            const firestoreDoc = await addDoc(collectionRef, {
                createdAt: new Date(),
                url,
                senderId,
                type,
                account: accessTokenObject.id,
            });

            console.log('firestoreDoc', firestoreDoc.id);

            const urlToPublish = await uploadFileFromUrl({
                url,
                firebaseId: firestoreDoc.id,
            });

            await createInstagramPostContainer({
                videoUrl: urlToPublish,
                caption:
                    'carcar.tech - оптовые цены на запчасти и расходники для авто для наших подписчиков (пока только в Астане). Пишите в директ, какая запчасть или какое масло вы ищите и мы предоставим вам лучшие цены с оптовых складов. Присылайте ссылку на свой профиль, чтобы мы убедились, что вы наш подписчик.',
                accessToken: accessTokenObject.token,
                firebaseId: firestoreDoc.id,
            });
        }
    }

    res.status(200).send('success');
});

app.get('/report', async (_req, res) => {
    const collectionRef = collection(firestore, 'media-post');
    const snaps = await getDocs(collectionRef);
    const docs = snaps.docs.map(
        (docEnt) => ({...docEnt.data(), id: docEnt.id} as unknown as MediaPostModel),
    );

    const published = docs.filter(({status}) => status === 'published');
    const notPublished = docs.filter(({status}) => status !== 'published');

    res.render('index', {total: docs.length, published, notPublished});
});

app.post('/remove-post-by-id', async (req, res) => {
    const {id} = req.body;
    console.log(`Получен ID поста: ${id}`);
    if (!id) {
        res.status(200).send('ID получен успешно.');
        return;
    }
    const collectionRef = collection(firestore, 'media-post');
    const docRef = doc(collectionRef, id);
    deleteDoc(docRef);
    // Здесь можно добавить логику обработки, например, сохранить ID в базе данных
    res.status(200).send('ID получен успешно.');
});

app.get('/publish', async (req, res) => {
    console.log(req.query);

    await findUnpublishedContainer();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
    console.log(`Example app listening on port ${appPort}`);
});

// cron.schedule('*/5 * * * *', () => {
//     console.log('Running bot task...');
//     findUnpublishedContainer();
// });
