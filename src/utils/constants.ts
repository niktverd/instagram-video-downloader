/**
 * Application constants and enums
 */

/**
 * PubSub related constants
 */
export enum PubSubTopic {
    INSTAGRAM_VIDEO_EVENTS = 'instagram-video-events',
}

/**
 * PubSub action types
 */
export enum PubSubAction {
    RUN_SCENARIO = 'run_scenario',
    INSTAGRAM_VIDEO_REQUESTED = 'instagram_video_requested',
    YOUTUBE_UPLOAD = 'youtube_upload',
    TEST = 'test',
    DEFAULT = 'default',
}

/**
 * Type for PubSub message payloads
 */
export type PubSubPayload = Record<string, unknown>;
