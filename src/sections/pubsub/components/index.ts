import {PublishBulkRunScenarioMessagesByIdsParams, PushPubSubTestParams} from '#src/types/pubsub';
import {PubSubAction, PubSubTopic, log, logError} from '#utils';

export const pushPubSubTest = async (params: PushPubSubTestParams) => {
    const {accountId, scenarioId, sourceId} = params;
    try {
        const topic = PubSubTopic.INSTAGRAM_VIDEO_EVENTS;
        log('[pubsub] Using topic:', topic);

        const {publishMessageToPubSub} = await import('../../../utils/pubsub-client');
        const pubsubProjectId = process.env.GCP_PROJECT_ID || '';
        log('[pubsub] Project ID:', pubsubProjectId);
        log('[pubsub] Using service account authentication');
        log(
            '[pubsub] GOOGLE_APPLICATION_CREDENTIALS:',
            process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set',
        );

        if (!pubsubProjectId) {
            log('[pubsub] Error: Missing project ID');
            throw new Error('Missing project ID');
        }

        const testMessage = {
            data: 'This is a test message for Instagram video events',
            timestamp: new Date().toISOString(),
            ...(accountId && {accountId}),
            ...(scenarioId && {scenarioId}),
            ...(sourceId && {sourceId}),
        };
        log('[pubsub] Test message:', testMessage);

        const attributes = {
            type: PubSubAction.TEST,
            timestamp: new Date().toISOString(),
            source: 'test-endpoint',
            ...(accountId && {accountId}),
            ...(scenarioId && {scenarioId}),
            ...(sourceId && {sourceId}),
        };
        log('[pubsub] Message attributes:', attributes);

        const success = await publishMessageToPubSub(topic, testMessage, attributes);
        log('[pubsub] Publish result:', success);

        if (success) {
            return {
                success: true,
                message: 'Test message published to Pub/Sub',
                topic,
                authMethod: 'service_account',
                ...(accountId && {accountId}),
                ...(scenarioId && {scenarioId}),
                ...(sourceId && {sourceId}),
            };
        } else {
            throw new Error('Failed to publish test message to Pub/Sub');
        }
    } catch (error) {
        logError('Error in push-pubsub test endpoint:', error);
        throw error;
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Publish messages in bulk for each accountId and scenarioId pair
 * This version takes explicit arrays of accountIds and scenarioIds
 */
export const publishBulkRunScenarioMessagesByIds = async (
    params: PublishBulkRunScenarioMessagesByIdsParams,
): Promise<{success: boolean; count: number}> => {
    try {
        const {sourceIds, accountIds, scenarioIds} = params;
        log('publishBulkRunScenarioMessagesByIds');
        const projectId = process.env.GCP_PROJECT_ID;
        log('projectId:', projectId);
        if (!projectId) {
            log('projectId is not set');
            throw new Error('GCP_PROJECT_ID environment variable is not set');
        }

        log(
            '[pubsub-client] Publishing bulk messages to topic:',
            PubSubTopic.INSTAGRAM_VIDEO_EVENTS,
        );
        log('[pubsub-client] Project ID:', projectId);

        // Import Google Cloud Pub/Sub client
        const {PubSub} = await import('@google-cloud/pubsub');

        // Calculate total number of messages to be sent
        let totalMessages = 0;

        // Create a client with proper authentication
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pubsubOptions: {projectId: string; keyFilename?: string; credentials?: any} = {
            projectId,
        };

        // Try to use GOOGLE_APPLICATION_CREDENTIALS
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            try {
                // Try to parse as JSON first
                pubsubOptions.credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
                log(
                    '[pubsub-client] Using credentials from GOOGLE_APPLICATION_CREDENTIALS as JSON',
                );
            } catch (e) {
                // If can't parse as JSON, treat as file path
                pubsubOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
                log(
                    '[pubsub-client] Using credentials from GOOGLE_APPLICATION_CREDENTIALS as file path',
                );
            }
        } else {
            log(
                '[pubsub-client] No explicit credentials provided, falling back to default authentication',
            );
        }

        const pubsubClient = new PubSub(pubsubOptions);

        // Configure batch publisher with appropriate settings
        const batchPublisher = pubsubClient.topic(PubSubTopic.INSTAGRAM_VIDEO_EVENTS, {
            batching: {
                maxMessages: 100, // Adjust based on your needs
                maxMilliseconds: 1000, // 1 second max wait time
            },
        });

        log('[pubsub-client] Created batch publisher for PubSub');

        // Track success count
        let successCount = 0;
        const promises: Promise<boolean>[] = [];

        // Create all messages and submit them to the batch publisher
        for (const sourceId of sourceIds) {
            for (const accountId of accountIds) {
                for (const scenarioId of scenarioIds) {
                    if (!accountId || !scenarioId) {
                        continue;
                    }

                    totalMessages++;

                    const payload = {
                        sourceId,
                        scenarioId,
                        accountId,
                        action: PubSubAction.RUN_SCENARIO,
                        requestedAt: new Date().toISOString(),
                    };

                    const dataBuffer = Buffer.from(JSON.stringify(payload));
                    const attributes = {
                        type: PubSubAction.RUN_SCENARIO,
                        timestamp: new Date().toISOString(),
                    };

                    // Add to batch via promise
                    promises.push(
                        (async () => {
                            try {
                                log('publishing message...');
                                log({payload, attributes});
                                const messageId = await batchPublisher.publishMessage({
                                    data: dataBuffer,
                                    attributes,
                                });
                                log(
                                    `[pubsub-client] Message ${messageId} published for scenario ${scenarioId} and account ${accountId}`,
                                );
                                return true;
                            } catch (error) {
                                console.log('error...', error);
                                logError(
                                    `[pubsub-client] Failed to publish message for scenario ${scenarioId} and account ${accountId}:`,
                                    error,
                                );
                                return false;
                            }
                        })(),
                    );
                }
            }
        }

        // Wait for all publish operations to complete
        const results = await Promise.all(promises);
        successCount = results.filter(Boolean).length;

        // Return results
        if (successCount > 0) {
            log(
                `[pubsub-client] Successfully published ${successCount}/${totalMessages} messages in batch, ${projectId}`,
            );
            return {success: true, count: successCount};
        } else {
            log('[pubsub-client] No messages were successfully published');
            throw new Error('No messages were successfully published');
        }
    } catch (error) {
        logError('[pubsub-client] Error publishing bulk messages to Pub/Sub:', error);
        throw error;
    }
};
