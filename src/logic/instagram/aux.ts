import {log} from '../../utils/logging';

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
