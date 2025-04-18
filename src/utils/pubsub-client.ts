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
        // Convert message to base64
        const data = Buffer.from(JSON.stringify(message)).toString('base64');

        // Endpoint for publishing to Pub/Sub
        const pubsubEndpoint = `https://pubsub.googleapis.com/v1/projects/${projectId}/topics/${topicName}:publish`;

        // Get the auth token if available
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // When running in GCP, auth is handled automatically
        // For local testing, you'd need to provide auth token manually

        // Prepare the publish request
        const pubsubMessage = {
            messages: [
                {
                    data,
                    attributes,
                },
            ],
        };

        // Send the publish request
        const response = await fetch(pubsubEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(pubsubMessage),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to publish message: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        log('Published message to Pub/Sub:', result);
        return true;
    } catch (error) {
        logError('Error publishing message to Pub/Sub:', error);
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
