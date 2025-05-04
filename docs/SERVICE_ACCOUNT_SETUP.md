# Setting Up Service Account Authentication for Google Cloud Pub/Sub

This guide explains how to set up service account authentication for the Instagram Video Downloader's Pub/Sub integration.

## Step 1: Create a Service Account

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "CREATE SERVICE ACCOUNT"
4. Enter a name (e.g., "pubsub-service-account") and description
5. Click "CREATE AND CONTINUE"

## Step 2: Assign Required Roles

In the "Grant this service account access to project" step:

1. Click "ADD ANOTHER ROLE"
2. Search for and select "Pub/Sub Publisher" role
3. Optionally add "Pub/Sub Subscriber" if you need to receive messages
4. Click "CONTINUE" and then "DONE"

## Step 3: Create a Service Account Key

1. Find your newly created service account in the list
2. Click the three dots menu at the end of the row and select "Manage keys"
3. Click "ADD KEY" > "Create new key"
4. Choose "JSON" format
5. Click "CREATE" - this will download the key file to your computer

## Step 4: Set Up Environment Variables

### For Local Development

1. Store the downloaded key file in a secure location, e.g., `~/.gcp/keys/pubsub-service-account-key.json`
2. Set the environment variable in your `.env` file:

```
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/pubsub-service-account-key.json
```

### For Docker Development

If using Docker, add the environment variable to your Docker configuration:

```yaml
environment:
  - GCP_PROJECT_ID=your-project-id
  - GOOGLE_APPLICATION_CREDENTIALS=/app/config/service-account-key.json
```

Then mount the service account key file as a volume:

```yaml
volumes:
  - /local/path/to/key.json:/app/config/service-account-key.json
```

### For Production Deployment

When deploying to Google Cloud services like Cloud Run, App Engine, or GKE:

1. The service automatically has access to a default service account
2. You can also specify which service account to use in your deployment configuration
3. You don't need to explicitly set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## Step 5: Test the Configuration

1. Ensure your environment variables are set correctly
2. Run the application
3. Make a request to the `/api/pubsub/push` endpoint
4. Check the logs to verify the message was published successfully

## Troubleshooting

If you encounter authentication issues:

1. Verify the service account key file exists and is accessible
2. Check that the environment variable points to the correct file
3. Ensure the service account has the proper roles assigned
4. Look for detailed error messages in the logs
5. Try running the `gcloud auth application-default login` command if testing locally

## Security Considerations

1. Never commit service account keys to version control
2. Use environment variables or secret management solutions
3. Limit the permissions of the service account to only what's needed
4. Regularly rotate service account keys
