require('dotenv').config();
const express = require('express');
var qs = require('qs');

const availableSenders = (process.env.ALLOWED_SENDER_ID || '').split(',').filter(Boolean);

const app = new express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.set('query parser', function (str) {
    return qs.parse(str, { /* custom options */ })
});

app.get('/webhooks', (req, res) => {
    console.log(req.query);
    const hubChallenge = req.query['hub.challenge'];
    console.log(hubChallenge);

    res.status(200).send(hubChallenge);
});

app.post('/webhooks', (req, res) => {
    console.log(req.query);
    console.log(JSON.stringify(req.body?.entry?.length, null, 3));

    const {object, entry} = req.body;

    if (object !== 'instagram') {
        res.status(404);
        return;
    }

    if (req.body?.entry?.length) {
        const entry = req.body.entry[0];
        if (!entry) {
            res.status(404);
            return;
        }

        if (!entry.messaging) {
            res.status(404);
            return;
        }

        const [messaging] = entry.messaging;

        console.log('messaging', messaging);

        const senderId = messaging.sender?.id;
        if (!availableSenders.includes(senderId)) {
            res.status(404);
            return;
        }

        const attachments = messaging.message?.attachments;
        if (!attachments.length) {
            res.status(404);
            return;
        }

        for (const attachment of attachments) {
            const {type, payload} = attachment;
            console.log({senderId, type, payload});
        }
    }

    res.status(200);
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
  console.log(`Example app listening on port ${appPort}`);
});