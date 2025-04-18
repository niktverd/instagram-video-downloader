import {Request, Response} from 'express';

import {log, logError} from '../utils/logging';

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
        const messageType = messageAttributes.type || 'default';

        switch (messageType) {
            case 'instagram_video_requested':
                // Handle Instagram video download request
                log('Processing Instagram video request');
                // Call your video processing logic here
                break;

            case 'youtube_upload':
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
