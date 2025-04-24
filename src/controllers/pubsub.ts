import {Request, Response} from 'express';

import {PubSubAction, PubSubTopic} from '../utils/constants';
import {log, logError} from '../utils/logging';

/**
 * Helper function to create a test request URL
 * @returns URL string to use for testing Instagram video events
 */
export const createTestPubSubRequest = (): string => {
    return `/api/pubsub/push`;
};

// eslint-disable-next-line valid-jsdoc
/**
 * Handler for Pub/Sub push messages
 * Processes messages sent from Pub/Sub to our webhook endpoint
 */
export const pubsubHandler = async (req: Request, res: Response) => {
    try {
        // Pub/Sub messages are received as base64-encoded strings
        if (!req.body || !req.body.message) {
            logError('Invalid Pub/Sub message format');
            res.status(400).send('Bad Request: Invalid Pub/Sub message format');
            return;
        }

        const pubsubMessage = req.body.message;

        // Get the base64-encoded data from the message
        const data = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : '';

        // Log details about the received message
        log(`Received Pub/Sub message: ${data}`);
        log(`Message ID: ${pubsubMessage.messageId}`);
        log(`Publish time: ${pubsubMessage.publishTime}`);

        // Parse the message data if it's JSON
        let parsedData;
        try {
            parsedData = JSON.parse(data);
            log('Parsed message data:', parsedData);
        } catch (error) {
            log('Message data is not valid JSON');
        }

        // Process the message based on attributes or content
        const messageAttributes = pubsubMessage.attributes || {};
        log('Message attributes:', messageAttributes);

        // Example: Check for message type attribute to determine processing logic
        const messageType = messageAttributes.type || PubSubAction.DEFAULT;

        switch (messageType) {
            case PubSubAction.INSTAGRAM_VIDEO_REQUESTED:
                // Handle Instagram video download request
                log('Processing Instagram video request');
                // Call your video processing logic here
                break;

            case PubSubAction.YOUTUBE_UPLOAD:
                // Handle YouTube upload request
                log('Processing YouTube upload request');
                // Call your YouTube upload logic here
                break;

            default:
                // Default processing
                log(`Processing message with default handler: ${messageType}`);
            // Implement default logic here
        }

        // Acknowledge the message by sending a success response
        // This tells Pub/Sub the message was processed successfully
        res.status(204).send();
    } catch (error) {
        logError('Error processing Pub/Sub message:', error);

        // Important: Return status code 200 to acknowledge the message
        // even on error to avoid Pub/Sub retrying. We handle retries ourselves
        // if needed based on the error type
        res.status(200).send('Error processing message');
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Simplified endpoint to push a test message to a Pub/Sub topic
 * Uses service account authentication via GOOGLE_APPLICATION_CREDENTIALS
 */
export const pushMessageToPubSub = async (_req: Request, res: Response) => {
    try {
        // Always use the Instagram video events topic
        const topic = PubSubTopic.INSTAGRAM_VIDEO_EVENTS;
        log('[pubsub] Using topic:', topic);

        // Import the PubSub client utility
        const {publishMessageToPubSub} = await import('../utils/pubsub-client');

        // Get project ID from environment variable
        const pubsubProjectId = process.env.GCP_PROJECT_ID || '';

        log('[pubsub] Project ID:', pubsubProjectId);
        log('[pubsub] Using service account authentication');
        log(
            '[pubsub] GOOGLE_APPLICATION_CREDENTIALS:',
            process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set',
        );

        if (!pubsubProjectId) {
            log('[pubsub] Error: Missing project ID');
            res.status(400).json({
                error: 'Project ID not found in environment variables',
            });

            return;
        }

        // Create a simple test message
        const testMessage = {
            data: 'This is a test message for Instagram video events',
            timestamp: new Date().toISOString(),
        };
        log('[pubsub] Test message:', testMessage);

        // Create attributes
        const attributes = {
            type: PubSubAction.TEST,
            timestamp: new Date().toISOString(),
            source: 'test-endpoint',
        };
        log('[pubsub] Message attributes:', attributes);

        // Publish the message using service account authentication
        const success = await publishMessageToPubSub(topic, testMessage, attributes);

        log('[pubsub] Publish result:', success);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Test message published to Pub/Sub',
                topic: topic,
                authMethod: 'service_account',
            });

            return;
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to publish test message to Pub/Sub',
            });

            return;
        }
    } catch (error) {
        logError('Error in push-pubsub test endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while pushing test message to Pub/Sub',
            errorMessage: error instanceof Error ? error.message : String(error),
        });

        return;
    }
};
