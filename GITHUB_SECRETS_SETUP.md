# GitHub Secrets Setup for Cloud Run Deployment

This guide explains how to set up the necessary secrets in your GitHub repository for automated deployment to Google Cloud Run.

## Required Secrets

Add the following secrets to your GitHub repository:

### Google Cloud Platform Secrets

1. `GCP_PROJECT_ID` - Your Google Cloud Platform project ID
2. `GCP_SA_KEY` - Your Google Cloud service account key (JSON format)

### Instagram API Secrets

3. `INSTAGRAM_APP_NAME` - Your Instagram app name
4. `INSTAGRAM_APP_ID` - Your Instagram app ID
5. `INSTAGRAM_APP_SECRET` - Your Instagram app secret
6. `INSTAGRAM_ACCESS_TOKEN` - Your Instagram access token
7. `INSTAGRAM_ACCESS_TOKEN_ARRAY` - Array of Instagram access tokens (if applicable)
8. `ALLOWED_SENDER_ID` - Allowed sender ID
9. `IG_ID` - Instagram ID

### Firebase Configuration

10. `FIREBASE_CONFIG` - Your Firebase configuration (JSON format)

### YouTube API Secrets

11. `YT_CLOUD_ID` - YouTube cloud ID
12. `YT_SECRET_ID` - YouTube secret ID
13. `YT_REDIRECT_URL` - YouTube redirect URL
14. `YT_REFRESH_TOKEN` - YouTube refresh token

## How to Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Enter the name of the secret and its value
6. Click "Add secret"

## Creating a Service Account Key for GCP

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Create a new service account or use an existing one
4. Grant the following roles:
   - Cloud Run Admin
   - Storage Admin
   - Service Account User
5. Create a new key in JSON format
6. Copy the contents of the downloaded JSON file and paste it as the value for the `GCP_SA_KEY` secret in GitHub

## Enabling Required APIs in GCP

Make sure the following APIs are enabled in your Google Cloud project:

- Cloud Run API
- Container Registry API
- Cloud Build API
- Resource Manager API
- IAM API 