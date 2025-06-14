import {log, logError} from '#utils';

const {API_SECRET} = process.env;

export const getLongLivedToken = async (shortLivedToken: string) => {
    try {
        const url = `https://graph.instagram.com/access_token
                ?grant_type=ig_exchange_token
                &client_secret=${API_SECRET}
                &access_token=${shortLivedToken}
            `.replace(/\s+/g, '');
        log('url', url);
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        log(response);

        const responseJson = await response.json();

        log('Long-lived Token:', responseJson);
        return responseJson.access_token;
    } catch (error) {
        logError('Error getting long-lived token:', error);
        console.error(error);
        return null;
    }
};
