import dotenv from 'dotenv';

import app from './app';
import {DelayMS} from './src/constants';
import {log} from './src/utils';

import {downloadVideoCron} from '$/chore/components/preprocess-video';

dotenv.config();

const dynamicPort = Number(process.env.PORT);
const appPort = isNaN(dynamicPort) ? 8080 : dynamicPort;

app.listen(appPort, () => {
    log(`Server listening on port ${appPort}`);
});

downloadVideoCron(DelayMS.Sec30);
