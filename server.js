const express = require('express');
var bodyParser = require('body-parser');

const app = new express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/api/verification', (req, res) => {
    console.log(req.params);
    const hubChallenge = req.params['hub.challenge'];

    res.send(hubChallenge);
});

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 3030 : dynamicPort;

app.listen(appPort, () => {
  console.log(`Example app listening on port ${port}`);
});