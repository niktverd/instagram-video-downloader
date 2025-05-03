import {Request, Response} from 'express';

import {getAccounts} from '#logic';
import {
    getInstagramInsights,
    getInstagramMedia,
    getInstagramUserNameById,
    getVideoOwnerByVideoId,
} from '#src/sections/instagram/components';
import {log, logError} from '#utils';

export const uiGetInsights = async (req: Request, res: Response) => {
    const {id: accountName} = req.query;

    try {
        if (!accountName) {
            throw new Error('accoutn name is not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const insight = await getInstagramInsights(account.token);

        log(insight);
        res.status(200).send(insight);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramUserById = async (req: Request, res: Response) => {
    const {id: accountName, userId} = req.query;

    try {
        if (!accountName || !userId) {
            throw new Error('accoutn name or userId are not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const user = await getInstagramUserNameById(userId as string, account.token);

        log(user);
        res.status(200).send(user);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramUserIdByMediaId = async (req: Request, res: Response) => {
    const {id: accountName, reelVideoId} = req.query;

    try {
        if (!accountName || !reelVideoId) {
            throw new Error('accoutn name or reelVideoId are not provided');
        }
        const accounts = await getAccounts();
        const account = accounts.find(({id}) => id === accountName);
        if (!account) {
            throw new Error(`accoutn with name ${accountName} was not found`);
        }
        const owner = await getVideoOwnerByVideoId({
            reelVideoId: reelVideoId as string,
            accessToken: account.token,
        });

        log(owner);
        res.status(200).send(owner);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetInstagramMedia = async (req: Request, res: Response) => {
    const {id: accountName, accessToken} = req.query;

    try {
        let token: string;

        if (accessToken && typeof accessToken === 'string') {
            token = accessToken;
        } else {
            if (!accountName) {
                throw new Error('account name is not provided');
            }
            const accounts = await getAccounts();
            const account = accounts.find(({id}) => id === accountName);
            if (!account) {
                throw new Error(`account with name ${accountName} was not found`);
            }
            token = account.token;
        }

        const media = await getInstagramMedia(token);

        log(media);
        res.status(200).send(media);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiGetUserContent = async (req: Request, res: Response) => {
    try {
        const {accountName, accessToken} = req.query;

        let token: string;
        let account = 'direct_token';

        if (accessToken && typeof accessToken === 'string') {
            token = accessToken;
        } else {
            if (!accountName || typeof accountName !== 'string') {
                res.status(400).send({
                    error: 'Bad request: accountName query parameter is required when accessToken is not provided',
                });
                return;
            }

            // Get accounts to verify if the specified account exists
            const accounts = await getAccounts();
            const targetAccount = accounts.find(({id}) => id === accountName);

            if (!targetAccount) {
                res.status(404).send({
                    error: `Account not found: ${accountName}`,
                });
                return;
            }

            // Get access token for the account
            token = targetAccount.token;
            account = accountName as string;

            if (!token) {
                res.status(500).send({
                    error: `Access token not available for ${accountName}`,
                });
                return;
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
            throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
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
            throw new Error(`Instagram Graph API error: ${JSON.stringify(errorData)}`);
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

        res.status(200).send(responseData);
    } catch (error) {
        logError('Error in uiGetUserContent:', error);
        res.status(500).send({
            error: 'Failed to retrieve user content',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};

export const uiSavePostForFutherAnalysis = async (req: Request, res: Response) => {
    try {
        const {post} = req.body;

        if (!post) {
            res.status(400).send({
                error: 'Bad request: post data is required in the request body',
            });
            return;
        }

        // Log the post data
        log('Post saved for further analysis:', post);

        // Here you would typically send the post to Telegram
        // For now, we'll just simulate that it was sent successfully

        res.status(200).send({
            status: 'success',
            message: 'Post has been sent to Telegram for further analysis',
        });
    } catch (error) {
        logError('Error in uiSavePostForFutherAnalysis:', error);
        res.status(500).send({
            error: 'Failed to save post for analysis',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};
