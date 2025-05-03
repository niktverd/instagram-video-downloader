# Google Cloud Pub/Sub Push Model Setup

This document explains how to set up and use Google Cloud Pub/Sub with a push model for Instagram Video Downloader.

## Overview

The Pub/Sub push model allows messages to be sent directly to our Cloud Run service endpoint when they are published to a topic. This enables asynchronous processing of tasks like video downloads and uploads without requiring polling.

## Deployment

The Pub/Sub deployment is now integrated into the main Cloud Run deployment workflow in `.github/workflows/cloud-run-deploy.yml`. This workflow:

1. Builds and deploys a Cloud Run service
2. Configures environment variables for Pub/Sub
3. Creates or updates a Pub/Sub topic
4. Creates a push subscription that forwards messages to our service endpoint
5. Configures necessary IAM permissions

This integration ensures that the Pub/Sub configuration always matches the deployed Cloud Run service.

## Prerequisites

Before using this feature, ensure the following secrets are set in your GitHub repository:

- `GCP_PROJECT_ID` - Your Google Cloud Project ID
- `GCP_SA_KEY` - A service account key JSON with permissions:
  - Cloud Run Admin
  - Storage Admin
  - Pub/Sub Admin
  - IAM Admin

## How It Works

1. **Message Publishing**:
   - A client publishes a message to the Pub/Sub topic
   - This can be done using the utility functions in `src/utils/pubsub-client.ts`

2. **Message Delivery**:
   - Pub/Sub automatically pushes the message to the configured endpoint `/pubsub-handler`
   - The message is delivered as an HTTP POST request

3. **Message Processing**:
   - The `pubsubHandler` in `src/controllers/pubsub.ts` processes the incoming message
   - Different actions are taken based on the message type

## Message Format

Messages have the following structure:

```json
{
  "message": {
    "data": "BASE64_ENCODED_MESSAGE_DATA",
    "messageId": "MESSAGE_ID",
    "publishTime": "TIMESTAMP",
    "attributes": {
      "type": "instagram_video_requested | youtube_upload | etc",
      "timestamp": "ISO_DATETIME"
    }
  }
}
```

## Example Usage

### 1. Request an Instagram Video Download

```typescript
import { requestInstagramVideoDownload } from './src/utils/pubsub-client';

// In your controller
await requestInstagramVideoDownload(
  'your-project-id',
  'instagram-video-events',
  'https://www.instagram.com/p/ABCDEF123456/',
  'user123'
);
```

### 2. Request a YouTube Upload

```typescript
import { requestYoutubeUpload } from './src/utils/pubsub-client';

// In your controller
await requestYoutubeUpload(
  'your-project-id',
  'instagram-video-events',
  '/path/to/video.mp4',
  'Video Title',
  'Video Description'
);
```

## Testing

To test locally:

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project your-project-id`
4. Publish a test message:

```bash
gcloud pubsub topics publish instagram-video-events \
  --message='{"mediaUrl":"https://example.com/video.mp4"}' \
  --attribute=type=instagram_video_requested
```

## Troubleshooting

1. **Messages not being received**:
   - Check the Cloud Run service logs
   - Verify the push subscription is correctly configured
   - Ensure the service account has invoker permissions

2. **Authentication errors**:
   - Check IAM permissions for the Pub/Sub service account
   - Ensure the service is publicly accessible or has proper authentication

3. **Invalid message format**:
   - Verify the message data format
   - Check that base64 encoding/decoding is working correctly 