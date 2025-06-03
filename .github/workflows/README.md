# GitHub Actions Workflows

## Overview

This repository contains two main deployment workflows:

1. **cloud-run-deploy.yml** - Original single-tier deployment (2GB/1CPU)
2. **deploy-tiered-infrastructure.yml** - Multi-tier deployment with resource escalation

## Triggers

Both workflows can be triggered by:

- **Automatic**: When a Pull Request is merged into the `main` branch
- **Manual**: Via GitHub Actions tab. **Ветка для деплоя выбирается через стандартный GitHub UI (Use workflow from) — это динамический селектор ветки, который определяет, из какой ветки будет запускаться workflow и деплоиться код.**

## deploy-tiered-infrastructure.yml

### Architecture

```
┌─────────────────────────┐
│  instagram-video-tasks  │ ← Main topic
└───────────┬─────────────┘
            │ 3 retries (30-60s)
            ↓
┌─────────────────────────┐
│    Small Tier           │
│  1GB RAM, 1 CPU         │
│  Max 100 instances      │
└───────────┬─────────────┘
            │ On failure
            ↓
┌─────────────────────────┐
│ instagram-video-tasks-  │
│      dead-1             │
└───────────┬─────────────┘
            │ 3 retries (60-120s)
            ↓
┌─────────────────────────┐
│    Medium Tier          │
│  2GB RAM, 1 CPU         │
│  Max 10 instances       │
└───────────┬─────────────┘
            │ On failure
            ↓
┌─────────────────────────┐
│ instagram-video-tasks-  │
│      dead-2             │
└───────────┬─────────────┘
            │ 3 retries (120-300s)
            ↓
┌─────────────────────────┐
│    Large Tier           │
│  4GB RAM, 2 CPU         │
│  Max 2 instances        │
└───────────┬─────────────┘
            │ On failure
            ↓
┌─────────────────────────┐
│ instagram-video-tasks-  │
│   dead-3 (manual)       │
└─────────────────────────┘
```

### Manual Deployment Options

When triggering manually from Actions tab:

- **Deploy Mode**:
  - `all` - Deploy all three tiers and setup Pub/Sub
  - `small-only` - Deploy only the small tier
  - `medium-only` - Deploy only the medium tier
  - `large-only` - Deploy only the large tier
  - `update-pubsub-only` - Update Pub/Sub subscriptions without deploying

### Service Names

- Small: `instagram-downloader-small`
- Medium: `instagram-downloader-medium`
- Large: `instagram-downloader-large`

### Cost Optimization

This tiered approach optimizes costs by:

- Processing most tasks on cheaper small instances
- Automatically escalating to larger instances only for complex tasks
- Limiting expensive large instances to only 2 concurrent

## cloud-run-deploy.yml

The original workflow deploys a single service with 2GB RAM and 1 CPU.

### Manual Deployment

When triggering manually:

- **Ветка для деплоя выбирается через стандартный GitHub UI (Use workflow from)**

## Shared Configuration

Configuration is centralized in:

- `.github/actions/shared-vars/action.yml` - Service configurations
- `.github/config/shared.env` - Environment variables
- Secrets in GitHub repository settings

## Monitoring

Failed tasks that reach `instagram-video-tasks-dead-3` require manual inspection:

```bash
# View messages in final dead letter queue
gcloud pubsub subscriptions pull instagram-video-tasks-dead-3-pull --auto-ack
```
