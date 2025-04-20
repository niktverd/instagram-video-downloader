/**
 * Utility for interacting with Google Cloud Pub/Sub
 * This file provides functions for publishing messages to Pub/Sub topics
 */

import {log, logError} from './logging';

// eslint-disable-next-line valid-jsdoc
/**
 * Publishes a message to a Pub/Sub topic via HTTP POST
 * This can be used from the client or server side to send messages
 * to our Pub/Sub topic
 */
export const publishMessageToPubSub = async (
    projectId: string,
    topicName: string,
    message: Record<string, any>,
    attributes: Record<string, string> = {},
): Promise<boolean> => {
    try {
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
        const messageId = await topic.publish(dataBuffer, attributes);
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
    action: 'instagram_video_requested' | 'youtube_upload' | string,
    payload: Record<string, any>,
): {
    message: Record<string, any>;
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
 * Example: Request an Instagram video download
 */
export const requestInstagramVideoDownload = async (
    projectId: string,
    topicName: string,
    mediaUrl: string,
    userId?: string,
): Promise<boolean> => {
    const {message, attributes} = createPubSubMessage('instagram_video_requested', {
        mediaUrl,
        userId,
        requestedAt: new Date().toISOString(),
    });

    return publishMessageToPubSub(projectId, topicName, message, attributes);
};

// eslint-disable-next-line valid-jsdoc
/**
 * Example: Request a YouTube upload
 */
export const requestYoutubeUpload = async (
    projectId: string,
    topicName: string,
    videoPath: string,
    title: string,
    description: string,
): Promise<boolean> => {
    const {message, attributes} = createPubSubMessage('youtube_upload', {
        videoPath,
        title,
        description,
        requestedAt: new Date().toISOString(),
    });

    return publishMessageToPubSub(projectId, topicName, message, attributes);
};
