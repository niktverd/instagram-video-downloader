import {log} from '#utils';

export const getInstagramInsights = async (accessToken: string) => {
    const metrics = [
        'impressions',
        'reach',
        'follower_count',
        // not in version 21
        // 'email_contacts',
        // 'phone_call_clicks',
        // 'text_message_clicks',
        // 'get_directions_clicks',
        // 'website_clicks',
        // 'profile_views',
        // not in version 21
        'online_followers',
        'accounts_engaged',
        'total_interactions',
        'likes',
        'comments',
        'shares',
        'saves',
        'replies',
        'engaged_audience_demographics',
        'reached_audience_demographics',
        'follower_demographics',
        'follows_and_unfollows',
        'profile_links_taps',
        'views',
        'threads_likes',
        'threads_replies',
        'reposts',
        'quotes',
        'threads_followers',
        'threads_follower_demographics',
        'content_views',
        'threads_views',
    ];
    // email_contacts, phone_call_clicks, text_message_clicks, get_directions_clicks, website_clicks, profile_views
    const insights = await fetch(
        `https://graph.instagram.com/v21.0/me/insights?metric=${metrics.join(
            ',',
        )}&period=day&access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    log({insights});

    const insightsJson = await insights.json();
    log({insightsJson});

    return insightsJson;
};

export const getInstagramMedia = async (accessToken: string) => {
    const mediaResponse = await fetch(
        `https://graph.instagram.com/v21.0/me/media?access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    log({mediaResponse});

    const mediaResponseJson = await mediaResponse.json();
    log({mediaResponseJson});

    return mediaResponseJson;
};

export const getInstagramUserNameById = async (userId: string, accessToken: string) => {
    // email_contacts, phone_call_clicks, text_message_clicks, get_directions_clicks, website_clicks, profile_views
    const userData = await fetch(
        `https://graph.instagram.com/v21.0/${userId}?access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    log({userData});

    const user = await userData.json();
    log({user});

    return user;
};

type GetVideoOwnerByVideoIdArgs = {
    reelVideoId: string;
    accessToken: string;
};

// not working because of https://stackoverflow.com/questions/35921660/get-media-from-public-accounts-with-instagram-api
export const getVideoOwnerByVideoId = async ({
    reelVideoId,
    accessToken,
}: GetVideoOwnerByVideoIdArgs) => {
    const accountName = '';
    console.log({reelVideoId});
    try {
        const accountNameResponse = await fetch(
            `https://graph.instagram.com/v22.0/${reelVideoId}?fields=owner&access_token=${accessToken}`,
            // `https://graph.instagram.com/v22.0/${reelVideoId}?fields=id&access_token=${accessToken}`,
            // `https://graph.instagram.com/v22.0/17895695668004550?fields=id,media_type,media_url,owner,timestamp&access_token=${accessToken}`,
            // `https://graph.instagram.com/v22.0/${reelVideoId}?fields=owner`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        console.log({accountNameResponse, accountName});
        const accountNameResponseJson = await accountNameResponse.json();
        console.log({accountNameResponseJson, accountName});
    } catch (error) {
        console.error(error);
    }

    return accountName;
};
