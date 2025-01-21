import {Request, Response} from 'express';

import {removePublished} from '../firebase';
import {stopHerokuApp} from '../heroku';
import {findUnpublishedContainer} from '../instagram';
import {delay} from '../utils';

export const publishIntagram = async (req: Request, res: Response) => {
    console.log(req.query);

    await findUnpublishedContainer();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    console.log(req.query);

    await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};
