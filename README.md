# Instagram Video Downloader

A service to download and process Instagram videos.

## Limitations

### IG caption

- If there are more than 20 hashtags in a caption, media will be published, but caption will be empty.

## Deployment to Google Cloud Run

### Prerequisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Create a Google Cloud Project
3. Enable the Cloud Run API, Cloud Build API, and Container Registry API

### Setup Environment Variables

Set up your environment variables in the Google Cloud Console. Go to Cloud Run > Your Service > Edit & Deploy New Revision > Variables.

Required environment variables (see .env.example for a complete list):

- INSTAGRAM_APP_ID
- INSTAGRAM_APP_SECRET
- INSTAGRAM_ACCESS_TOKEN
- FIREBASE_CONFIG
- PORT (will be set automatically by Cloud Run)

### Manual Deployment

1. Build the Docker image:

   ```
   docker build -t gcr.io/[PROJECT_ID]/instagram-video-downloader .
   ```

2. Push to Google Container Registry:

   ```
   docker push gcr.io/[PROJECT_ID]/instagram-video-downloader
   ```

3. Deploy to Cloud Run:
   ```
   gcloud run deploy instagram-video-downloader \
     --image gcr.io/[PROJECT_ID]/instagram-video-downloader \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Automated Deployment with Cloud Build

1. Connect your GitHub repository to Cloud Build
2. Create a build trigger that uses the cloudbuild.yaml configuration

Cloud Build will automatically build and deploy your application whenever you push to your repository.

### Automated Deployment with GitHub Actions

This project includes a GitHub Actions workflow for automatic deployment to Google Cloud Run when you push to the main branch.

To set up GitHub Actions deployment:

1. Configure the required GitHub repository secrets - see [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) for detailed instructions
2. Push your code to the main branch
3. The workflow will automatically build and deploy your application to Google Cloud Run

You can also manually trigger deployments using the "Run workflow" button in the GitHub Actions tab.

### Local Testing

To test the Docker container locally before deployment:

```
npm run docker:test
```

This will build and run the Docker container, making it available at http://localhost:8080.

## Finding Unused Code with Knip

This project uses [knip](https://github.com/webpro/knip), a tool for finding unused code in JavaScript/TypeScript projects.

### Available Scripts

```bash
# Run a full knip analysis
npm run knip

# Show a more compact report
npm run knip:unused

# Check only for unused files
npm run knip:files

# Check only for unused dependencies
npm run knip:deps

# Check only for unused exports
npm run knip:exports

# Check only for unused types
npm run knip:types

# Fix automatically removable issues
npm run knip:fix

# Trace exports in a specific file
npm run knip:trace-file src/path/to/your/file.ts
```

### Pre-commit Hook

This project has a Git pre-commit hook that automatically runs knip before each commit. If new unused code issues are detected, the commit will be blocked until they are fixed.

To bypass the hook in emergency situations:

```bash
git commit --no-verify
```

Check the [report/README.md](./report/README.md) file for more details about the knip integration.

### Identified Unused Code

A list of unused code identified by knip is maintained in [UNUSED_CODE.md](./UNUSED_CODE.md).
