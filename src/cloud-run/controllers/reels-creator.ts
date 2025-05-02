import {Request, Response} from 'express';

import {crop} from '../components/reels-creator/create-video';

export const createVideo = async (req: Request, res: Response) => {
    await crop(req, res);
};
