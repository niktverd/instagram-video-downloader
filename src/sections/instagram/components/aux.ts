/* eslint-disable @typescript-eslint/no-explicit-any */
import {getAccountById} from '#src/db';
import {IResponse} from '#src/types/common';
import {
    GetAllCommentsForPostsParams,
    GetAllCommentsForPostsResponse,
    GetInstagramAccountInsightsParams,
    GetInstagramAccountInsightsResponse,
    UiGetInsightsParams,
    UiGetInsightsResponse,
    UiGetInstagramMediaParams,
    UiGetInstagramMediaResponse,
    UiGetInstagramUserIdByMediaIdParams,
    UiGetInstagramUserIdByMediaIdResponse,
    UiGetUserContentParams,
    UiGetUserContentResponse,
} from '#src/types/instagramInsights';
import {ThrownError} from '#src/utils/error';
import {log} from '#utils';
import {getAccounts} from '$/shared';

export const getInstagramInsights = async (
    accessToken: string,
    period: 'day' | 'week' | 'month' | 'year' = 'day',
) => {
    const metrics = [
        // 'impressions',
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
    log({accessToken, period});
    const insights = await fetch(
        `https://graph.instagram.com/v22.0/me/insights?metric=${metrics.join(
            ',',
        )}&period=${period}&access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    const insightsJson = await insights.json();

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

export const getInstagramAccountInsights = async (
    params: GetInstagramAccountInsightsParams,
): IResponse<GetInstagramAccountInsightsResponse> => {
    const insights = await getInstagramInsights(params.accessToken, params.period);
    return {result: insights, code: 200};
};

// Чистая функция
export const getAllCommentsForPosts = async ({
    accessToken,
}: GetAllCommentsForPostsParams): IResponse<GetAllCommentsForPostsResponse> => {
    console.log({accessToken});
    if (!accessToken) {
        throw new ThrownError('Access token is required', 400);
    }

    const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id&access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        },
    );
    // console.log({userResponse});
    if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new ThrownError(`Instagram API error: ${JSON.stringify(errorData)}`, 400);
    }
    const userData = await userResponse.json();
    // console.log({userData});
    const igUserId = userData.id;
    const mediaResponse = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,caption,video_url&access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        },
    );
    // console.log({mediaResponse});
    if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new ThrownError(`Instagram API error: ${JSON.stringify(errorData)}`, 400);
    }
    const mediaData = await mediaResponse.json();
    // console.log({mediaData});
    const media = mediaData.data || [];
    const commentsByMedia = await Promise.all(
        media.map(async (item: any) => {
            try {
                const commentsResponse = await fetch(
                    `https://graph.instagram.com/v21.0/${item.id}/comments?fields=id,text&access_token=${accessToken}`,
                    {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json'},
                    },
                );
                // console.log({commentsResponse});
                if (!commentsResponse.ok) {
                    return {media_id: item.id, comments: [], error: 'Failed to fetch comments'};
                }
                const commentsData = await commentsResponse.json();
                console.log({itemId: item.id, item, commentsData: JSON.stringify(commentsData)});
                return {media_id: item.id, comments: commentsData.data || []};
            } catch (err) {
                return {media_id: item.id, comments: [], error: String(err)};
            }
        }),
    );
    return {result: commentsByMedia, code: 200};
};

export const getInstagramInsightsFirebase = async (
    params: UiGetInsightsParams,
): IResponse<UiGetInsightsResponse> => {
    const {id} = params;
    const {result: account} = await getAccountById({id: Number(id)});
    if (!account) {
        throw new ThrownError(`account with id ${id} was not found`, 400);
    }

    if (!account.token) {
        throw new ThrownError('account token is unavailable', 400);
    }

    const insight = await getInstagramInsights(account.token);

    return {result: insight, code: 200};
};

// getInstagramMediaFirebase
export const getInstagramMediaFirebase = async (
    params: UiGetInstagramMediaParams,
): IResponse<UiGetInstagramMediaResponse> => {
    const {id: accountName, accessToken} = params;

    let token: string;

    if (accessToken) {
        token = accessToken;
    } else {
        if (!accountName) {
            throw new ThrownError('account name is not provided', 400);
        }
        const {result: account} = await getAccountById({id: Number(accountName)});
        if (!account) {
            throw new ThrownError(`account with id ${accountName} was not found`, 400);
        }

        if (!account.token) {
            throw new ThrownError('account token is unavailable', 400);
        }

        token = account.token;
    }

    const media = await getInstagramMedia(token);

    return {result: media, code: 200};
};

export const getInstagramUserIdByMediaIdFirebase = async (
    params: UiGetInstagramUserIdByMediaIdParams,
): IResponse<UiGetInstagramUserIdByMediaIdResponse> => {
    const {id: accountName, reelVideoId} = params;

    try {
        if (!accountName || !reelVideoId) {
            throw new ThrownError('accoutn name or reelVideoId are not provided', 400);
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id.toString() === accountName);
        if (!account) {
            throw new ThrownError(`account with name ${accountName} was not found`, 400);
        }
        const owner = await getVideoOwnerByVideoId({
            reelVideoId: reelVideoId as string,
            accessToken: account.token,
        });

        log(owner);
        return {result: owner, code: 200};
    } catch (error) {
        throw new ThrownError(`error getting instagram user id by media id: ${String(error)}`, 500);
    }
};

export const getInstagramUserContentFirebase = async (
    params: UiGetUserContentParams,
): IResponse<UiGetUserContentResponse> => {
    try {
        const {accountName, accessToken} = params;
        let token: string;
        let account = 'direct_token';
        if (accessToken && typeof accessToken === 'string') {
            token = accessToken;
        } else {
            if (!accountName || typeof accountName !== 'string') {
                // res.status(400).send({
                //     error: 'Bad request: accountName query parameter is required when accessToken is not provided',
                // });
                // return;
                throw new ThrownError('account name is not provided', 400);
            }
            // Get accounts to verify if the specified account exists
            const accounts = await getAccounts();
            const targetAccount = accounts.find(({id}) => id.toString() === accountName);
            if (!targetAccount) {
                // res.status(404).send({
                //     error: `Account not found: ${accountName}`,
                // });
                // return;
                throw new ThrownError(`account with name ${accountName} was not found`, 400);
            }
            // Get access token for the account
            token = targetAccount.token;
            account = accountName as string;
            if (!token) {
                // res.status(500).send({
                //     error: `Access token not available for ${accountName}`,
                // });
                // return;
                throw new ThrownError(`access token not available for ${accountName}`, 400);
            }
        }
        // Get the Instagram user ID for the authenticated user
        const userResponse = await fetch(
            `https://graph.instagram.com/me?fields=id,username,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${token}`,
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            },
        );
        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new ThrownError(`Instagram API error: ${JSON.stringify(errorData)}`, 400);
        }
        const userData = await userResponse.json();
        const igUserId = userData.id;
        // Fetch media data using the Instagram Graph API with insights
        const mediaResponse = await fetch(
            `https://graph.instagram.com/v22.0/${igUserId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count,plays,impressions,children{id,media_type,media_url,thumbnail_url}&access_token=${token}`,
            {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            },
        );
        if (!mediaResponse.ok) {
            const errorData = await mediaResponse.json();
            throw new ThrownError(`Instagram Graph API error: ${JSON.stringify(errorData)}`, 400);
        }
        const mediaData = await mediaResponse.json();
        const media = mediaData.data || [];
        // Fetch insights for each media item
        const mediaWithInsights = await Promise.all(
            // eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
            media.map(async (item: any) => {
                try {
                    // Different metrics are available for different media types
                    let metricsToFetch = '';
                    // Determine which metrics to fetch based on media type
                    if (item.media_type === 'VIDEO') {
                        const metrics = [
                            // 'impressions',
                            // 'plays',
                            // 'replies',
                            // 'video_views',
                            // 'navigation',
                            // 'follows',
                            // 'profile_visits',
                            // 'profile_activity',
                            // 'clips_replays_count',
                            // 'thread_replies',
                            // 'reposts',
                            // 'quotes',
                            // 'peak_concurrent_viewers',
                            // 'thread_shares',
                            // 'content_views',
                            // 'threads_views',
                            // 'ig_reels_aggregated_all_plays_count',
                            'shares',
                            'comments',
                            'likes',
                            'saved',
                            'total_interactions',
                            'reach',
                            'ig_reels_video_view_total_time',
                            'ig_reels_avg_watch_time',
                            'views',
                            'saved',
                        ];
                        metricsToFetch = metrics.join(',');
                    } else if (item.media_type === 'CAROUSEL_ALBUM') {
                        metricsToFetch =
                            'carousel_album_carousel_album_carousel_album_reach,carousel_album_saved';
                    } else if (item.media_type === 'IMAGE') {
                        metricsToFetch = 'reach,saved';
                    } else {
                        // For unsupported media types, just return the item without insights
                        return item;
                    }
                    const insightsResponse = await fetch(
                        `https://graph.instagram.com/v22.0/${item.id}/insights?metric=${metricsToFetch}&access_token=${token}`,
                        {
                            method: 'GET',
                            headers: {'Content-Type': 'application/json'},
                        },
                    );
                    // Log the response for debugging
                    const responseData = await insightsResponse.json();
                    if (insightsResponse.ok && responseData.data) {
                        // Extract metrics from the response
                        const metrics: Record<string, number> = {};
                        if (Array.isArray(responseData.data)) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            responseData.data.forEach((metric: any) => {
                                if (metric.name && metric.values && metric.values.length > 0) {
                                    metrics[metric.name] = metric.values[0].value || 0;
                                }
                            });
                        }
                        // Return with the appropriate metrics based on media type
                        if (item.media_type === 'VIDEO') {
                            return {
                                ...item,
                                shares: metrics.shares || 0,
                                comments: metrics.comments || 0,
                                likes: metrics.likes || 0,
                                saved: metrics.saved || 0,
                                total_interactions: metrics.total_interactions || 0,
                                reach: metrics.reach || 0,
                                // ig_reels_video_view_total_time: metrics.ig_reels_video_view_total_time || 0,
                                // ig_reels_avg_watch_time: metrics.ig_reels_avg_watch_time || 0,
                                views: metrics.views || 0,
                            };
                        } else if (item.media_type === 'CAROUSEL_ALBUM') {
                            return {
                                ...item,
                                impression_count: metrics.carousel_album_impressions || 0,
                                reach_count: metrics.carousel_album_reach || 0,
                                engagement_count: metrics.carousel_album_engagement || 0,
                                saved_count: metrics.carousel_album_saved || 0,
                            };
                        } else if (item.media_type === 'IMAGE') {
                            return {
                                ...item,
                                impression_count: metrics.impressions || 0,
                                reach_count: metrics.reach || 0,
                                engagement_count: metrics.engagement || 0,
                                saved_count: metrics.saved || 0,
                            };
                        }
                    }
                } catch (error) {
                    console.log(`Error fetching insights for media ${item.id}:`, error);
                }
                // If we get here, there was an error or the media type wasn't supported
                return item;
            }),
        );
        // Format the response to include user info and media data with insights
        const responseData = {
            account,
            ig_user_id: igUserId,
            user_info: {
                username: userData.username || '',
                biography: userData.biography || '',
                followers_count: userData.followers_count || 0,
                follows_count: userData.follows_count || 0,
                media_count: userData.media_count || 0,
                profile_picture_url: userData.profile_picture_url || '',
                website: userData.website || '',
            },
            media: mediaWithInsights,
            paging: mediaData.paging || {},
        };
        return {result: responseData, code: 200};
    } catch (error) {
        throw new ThrownError(`error getting instagram user content: ${String(error)}`, 500);
    }
};
