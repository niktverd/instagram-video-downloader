const express = require('express');
var qs = require('qs');

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
    console.log(req.body);

    res.status(200);
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
  console.log(`Example app listening on port ${appPort}`);
});