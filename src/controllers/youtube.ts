import {Request, Response} from 'express';
import {google} from 'googleapis';

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.YT_CLOUD_ID,
    process.env.YT_SECRET_ID,
    process.env.YT_REDIRECT_URL,
);

export const youtubeAuth = (_req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });
    res.redirect(url);
};

export const youtubeAuthCallback = async (req: Request, res: Response) => {
    try {
        const {code} = req.query;
        const {tokens} = await oauth2Client.getToken(code as string);
        console.log(JSON.stringify(tokens));
        res.send(tokens);
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('error during oauth');
    }
};
