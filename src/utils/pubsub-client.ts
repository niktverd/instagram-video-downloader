/**
 * Utility for interacting with Google Cloud Pub/Sub
 * This file provides functions for publishing messages to Pub/Sub topics
 */

import {PubSubAction, PubSubPayload, PubSubTopic} from './constants';
import {log, logError} from './logging';

// eslint-disable-next-line valid-jsdoc
/**
 * Publishes a message to a Pub/Sub topic via HTTP POST
 * This can be used from the client or server side to send messages
 * to our Pub/Sub topic
 */
export const publishMessageToPubSub = async (
    topicName: string,
    message: PubSubPayload,
    attributes: Record<string, string> = {},
): Promise<boolean> => {
    try {
        const projectId = process.env.GCP_PROJECT_ID;
        log('[pubsub-client] Project ID:', projectId, 'topicName:', topicName);
        if (!projectId) {
            throw new Error('GCP_PROJECT_ID environment variable is not set');
        }

        log('[pubsub-client] Publishing message to topic:', topicName);
        log('[pubsub-client] Project ID:', projectId);

        // Import Google Cloud Pub/Sub client
        const {PubSub} = await import('@google-cloud/pubsub');

        // Create a client, it will automatically detect credentials
        // from GOOGLE_APPLICATION_CREDENTIALS environment variable
        const pubsubClient = new PubSub({projectId});
        log('[pubsub-client] Created PubSub client');

        // Get a reference to the topic
        const topic = pubsubClient.topic(topicName);

        // Convert message to Buffer
        const dataBuffer = Buffer.from(JSON.stringify(message));

        // Publish the message
        log('[pubsub-client] Publishing message...');
        const messageId = await topic.publishMessage({data: dataBuffer, attributes});
        log('[pubsub-client] Published message with ID:', messageId);
        return true;
    } catch (error) {
        logError('[pubsub-client] Error publishing message to Pub/Sub:', error);
        return false;
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Helper function for creating a message with proper attributes for different actions
 */
export const createPubSubMessage = (
    action: PubSubAction,
    payload: PubSubPayload,
): {
    message: PubSubPayload;
    attributes: Record<string, string>;
} => {
    return {
        message: payload,
        attributes: {
            type: action,
            timestamp: new Date().toISOString(),
        },
    };
};

// eslint-disable-next-line valid-jsdoc
/**
 * Request to run a scenario
 */
export const requestRunScenario = async (
    sourceId: string,
    scenarioId: string,
    accountId: string,
): Promise<boolean> => {
    const {message, attributes} = createPubSubMessage(PubSubAction.RUN_SCENARIO, {
        sourceId,
        scenarioId,
        accountId,
        requestedAt: new Date().toISOString(),
    });

    return publishMessageToPubSub(PubSubTopic.INSTAGRAM_VIDEO_EVENTS, message, attributes);
};

// eslint-disable-next-line valid-jsdoc
/**
 * Publish messages in bulk for each account and scenario pair
 * This helps reduce API calls when sending similar messages for multiple accounts and scenarios
 */
export const publishBulkRunScenarioMessages = async (
    sourceId: string,
    scenarioIds: string[],
    accountIds: string[],
): Promise<{success: boolean; count: number}> => {
    try {
        log('publishBulkRunScenarioMessages');
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
        const totalMessages = scenarioIds.length * accountIds.length;

        // Create a client with batching configuration
        const pubsubClient = new PubSub({projectId});

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
        for (const scenarioId of scenarioIds) {
            for (const accountId of accountIds) {
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
                            const messageId = await batchPublisher.publishMessage({
                                data: dataBuffer,
                                attributes,
                            });
                            log(
                                `[pubsub-client] Message ${messageId} published for scenario ${scenarioId} and account ${accountId}`,
                            );
                            return true;
                        } catch (error) {
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
            return {success: false, count: 0};
        }
    } catch (error) {
        logError('[pubsub-client] Error publishing bulk messages to Pub/Sub:', error);
        return {success: false, count: 0};
    }
};
