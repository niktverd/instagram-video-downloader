import {Request, Response} from 'express';

import {getLongLivedToken} from '../utils';

import {log} from '#utils';

const REDIRECT_URI =
    'https://instagram-video-downloader-e0875c65c071.herokuapp.com/callback-instagram';

const {APP_ID, API_SECRET} = process.env;

const SCOPES = [
    // 'user_profile',
    // 'user_media',
    // 'instagram_basic',
    // 'instagram_business_basic',
    // 'instagram_content_publish',
    // 'instagram_business_content_publish',
    // 'instagram_business_manage_comments',
    // 'instagram_business_manage_messages',
    'instagram_business_basic',
    // 'instagram_business_manage_messages',
    // 'instagram_business_manage_comments',
    'instagram_business_content_publish',
    // 'instagram_business_manage_insights',
];
const STRINGIFIED_SCOPES = SCOPES.join('%2c');

export const instagramLogin = (req: Request, res: Response) => {
    const redirectionUri = (req.query.redirectionUri as string) || '';

    const authUrl = `https://api.instagram.com/oauth/authorize
      ?client_id=${APP_ID}
      &redirect_uri=${REDIRECT_URI}
      &scope=${STRINGIFIED_SCOPES}
      &response_type=code
      &state=${encodeURIComponent(redirectionUri)}`.replace(/\s+/g, '');

    log({authUrl});

    res.redirect(authUrl);
};

export const callbackInstagramLogin = async (req: Request, res: Response) => {
    const code = req.query.code;
    const state = (req.query.state as string) || '';

    if (!code) {
        res.status(400).send('Authorization failed');
        return;
    }

    log({
        client_id: APP_ID || '',
        redirect_uri: REDIRECT_URI || '',
        client_secret: API_SECRET || '',
        code: (code as string) || '',
        state: (state as string) || '',
    });
    const uri = `https://api.instagram.com/oauth/access_token`.replace(/\s+/g, '');
    log({uri});

    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                client_id: APP_ID as string,
                client_secret: API_SECRET as string,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI as string,
                code: code as string,
            }).toString(),
        });
        log(response);
        console.log(response);
        const responseJson = await response.json();
        log(responseJson);
        const {access_token: accessToken, user_id: userId} = responseJson;
        const longLivedToken = await getLongLivedToken(accessToken);

        if (state) {
            // If redirectionUri was provided, redirect to it with token
            res.redirect(`${decodeURIComponent(state)}?token=${longLivedToken}&userId=${userId}`);
            return;
        }

        // Default response if no redirection URI
        res.send(`
            longLivedToken: ${longLivedToken}
            userId: ${userId}
            accessToken: ${accessToken}
            responseJson: ${JSON.stringify(responseJson)}
            state: ${state}
        `);
    } catch (err) {
        log({err});
        console.log(err);
        res.send(JSON.stringify(err));
    }
};
