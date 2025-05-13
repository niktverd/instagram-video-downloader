import {Request, Response} from 'express';

import {getLongLivedToken} from '../utils';

import {log} from '#utils';

const REDIRECT_URI =
    'https://instagram-video-downloader-e0875c65c071.herokuapp.com/callback-instagram';

const {APP_ID, API_SECRET} = process.env;

const FB_API_VERSION = 'v19.0';

const SCOPES = [
    // Business permissions
    'instagram_business_basic',
    'instagram_business_content_publish',
    // add more if you need: 'instagram_business_manage_comments', 'instagram_business_manage_messages', ...
];

// Facebook expects scopes to be comma-separated (no pre-encoding)
const STRINGIFIED_SCOPES = SCOPES.join(',');

export const instagramLogin = (req: Request, res: Response) => {
    const redirectionUri = (req.query.redirectionUri as string) || '';
    const encRedirect = encodeURIComponent(REDIRECT_URI);
    const encScopes = encodeURIComponent(STRINGIFIED_SCOPES);
    const encState = encodeURIComponent(redirectionUri);
    const authUrl = `https://www.facebook.com/${FB_API_VERSION}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encRedirect}&scope=${encScopes}&response_type=code&state=${encState}`;

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
    const uri = `https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token?client_id=${APP_ID}&client_secret=${API_SECRET}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI,
    )}&code=${code}`;
    log({uri});

    try {
        const response = await fetch(uri, {
            method: 'GET',
        });
        log(response);
        console.log(response);
        const responseJson = await response.json();
        log(responseJson);

        const {access_token: accessToken} = responseJson;

        // exchange for long-lived token so the frontend can store something that lasts ~60 days
        const longLivedToken = await getLongLivedToken(accessToken);

        // Fetch IG user id using the new token (optional)
        let userId = '';
        try {
            const meRes = await fetch(
                `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`,
            );
            const meJson = await meRes.json();
            userId = meJson.id || '';
        } catch (e) {
            log('Failed to fetch user id', e);
        }

        if (state) {
            // If redirectionUri was provided, redirect to it with token
            res.redirect(`${decodeURIComponent(state)}?token=${longLivedToken}&userId=${userId}`);
            return;
        }

        // Default response if no redirection URI
        res.send(`
            longLivedToken: ${longLivedToken}
            accessToken: ${accessToken}
            userId: ${userId}
            responseJson: ${JSON.stringify(responseJson)}
            state: ${state}
        `);
    } catch (err) {
        log({err});
        console.log(err);
        res.send(JSON.stringify(err));
    }
};
