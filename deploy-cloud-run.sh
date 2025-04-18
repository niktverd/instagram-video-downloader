#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set variables (customize these)
PROJECT_ID="media-automation"
SERVICE_NAME="instagram-video-downloader"
REGION="us-central1"
MEMORY="512Mi"
CPU="1"
TIMEOUT="300"  # 5 minutes
CONCURRENCY="1"

# Build the image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Push the image to Container Registry
echo "Pushing image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --memory $MEMORY \
  --cpu $CPU \
  --timeout $TIMEOUT \
  --concurrency $CONCURRENCY \
  --allow-unauthenticated

echo "Deployment completed!"
echo "Your service should be available at the URL shown above." 