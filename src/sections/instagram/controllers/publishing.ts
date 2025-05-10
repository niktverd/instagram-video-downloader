import {Request, Response} from 'express';

import {
    canInstagramPostBePublished,
    createInstagramPostContainer,
    prepareMediaContainersForAccount,
    publishInstagramPostContainer,
    publishRandomInstagramContainerForAccount,
} from '../components';

import {getAllAccounts} from '#src/db';
import {delay, log, logError} from '#utils';
import {stopHerokuApp} from '$/chore/components/heroku';

export const publishById = async (req: Request, res: Response) => {
    try {
        log({body: req.body});
        const {id, accessToken} = req.body;
        if (!id || !accessToken) {
            throw new Error('no id or accessToken found in body');
        }

        const result = await publishInstagramPostContainer({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            containerId: id,
            accessToken: accessToken,
        });
        log({result});
    } catch (error) {
        log(error);
    }
    res.status(200).send('published-by-id');
};

export const publishVideoFromUrl = async (req: Request, res: Response) => {
    try {
        log({body: req.body});
        const {videoUrl, caption, accessToken} = req.body;

        // Check if videoUrl and accessToken are provided
        if (!videoUrl || !accessToken) {
            res.status(400).json({
                success: false,
                error: 'Video URL and access token are required',
            });

            return;
        }

        // Create a container for the Instagram post
        const createContainerResponse = await createInstagramPostContainer({
            videoUrl,
            caption: caption || '', // Use provided caption or empty string
            accessToken,
        });

        if (!createContainerResponse.success || !createContainerResponse.mediaContainerId) {
            res.status(500).json({
                success: false,
                error: createContainerResponse.error || 'Failed to create media container',
            });

            return;
        }

        const mediaContainerId = createContainerResponse.mediaContainerId;

        res.status(200).json({
            success: true,
            message:
                'Media container created successfully. It can take up to 10 minutes to be ready. Please, be patient. Check your Instagram account to see the post later.',
        });

        // Check if the container is ready to be published with retries
        let isReady = false;
        const maxRetries = 10;
        const delayBetweenRetries = 10000; // 10 seconds in milliseconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            log(`Checking if container is ready (attempt ${attempt}/${maxRetries})`);

            isReady = await canInstagramPostBePublished({
                mediaContainerId,
                accessToken,
            });

            if (isReady) {
                log(`Container is ready to publish on attempt ${attempt}`);
                break;
            }

            if (attempt < maxRetries) {
                log(
                    `Container not ready, waiting ${
                        delayBetweenRetries / 1000
                    } seconds before retry...`,
                );
                await delay(delayBetweenRetries);
            }
        }

        if (!isReady) {
            return;
        }

        // Publish the container
        const publishResponse = await publishInstagramPostContainer({
            containerId: mediaContainerId,
            accessToken,
        });

        log({publishResponse});

        return;
    } catch (error: unknown) {
        logError(error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });

        return;
    }
};

export const removePublishedFromFirebase = async (req: Request, res: Response) => {
    log(req.query);

    // await removePublished();

    res.status(200).send('success');
    await delay(1000);

    await stopHerokuApp();
};

export const publishIntagramV4 = async (req: Request, res: Response) => {
    log(req.query);

    try {
        const accounts = await getAllAccounts({});

        for (const account of accounts) {
            try {
                // publish one container
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await publishRandomInstagramContainerForAccount(account as any);

                // prepare one container if necessary
                await prepareMediaContainersForAccount(account);
            } catch (error) {
                logError('trycatch for one cycle', error);
                console.log('error', error);
            }
        }

        // update record in db
        res.status(200).send('success');
    } catch (error) {
        logError('trycatch for entire publish process', error);
        res.status(200).send('error');
    } finally {
        await delay(1000);
        await stopHerokuApp();
    }
};
