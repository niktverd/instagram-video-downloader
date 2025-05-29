import {Request, Response} from 'express';

import {
    canInstagramPostBePublished,
    createInstagramPostContainer,
    prepareMediaContainersForAccount,
    publishInstagramPostContainer,
    publishRandomInstagramContainerForAccount,
} from '../components';

import {PublishIntagramV4Schema} from '#schemas/handlers/publishInstagram';
import {getAllAccounts, wrapper} from '#src/db';
import {ApiFunctionPrototype} from '#src/types/common';
import {
    PublishIntagramV4PostParams,
    PublishIntagramV4PostResponse,
} from '#src/types/publishInstagram';
import {ThrownError} from '#src/utils/error';
import {delay, log, logError} from '#utils';
import {stopHerokuApp} from '$/chore/components/heroku';

export const publishById = async (req: Request, res: Response) => {
    try {
        log({body: req.body});
        const {id, accessToken} = req.body;
        if (!id || !accessToken) {
            throw new ThrownError('no id or accessToken found in body', 400);
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

const publishIntagramV4: ApiFunctionPrototype<
    PublishIntagramV4PostParams,
    PublishIntagramV4PostResponse
> = async (_params, db) => {
    const {result: accounts} = await getAllAccounts({onlyEnabled: true}, db);

    for (const account of accounts) {
        try {
            await publishRandomInstagramContainerForAccount(account, db);
            await prepareMediaContainersForAccount(account, db);
        } catch (error) {
            logError('error publishing instagram container', error);
        }
    }

    return {result: {success: true, message: 'success'}, code: 200};
};

export const publishIntagramV4Post = wrapper<
    PublishIntagramV4PostParams,
    PublishIntagramV4PostResponse
>(publishIntagramV4, PublishIntagramV4Schema, 'GET');
