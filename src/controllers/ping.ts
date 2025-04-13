import {Request, Response} from 'express';

export const pingPong = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'success',
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
};
