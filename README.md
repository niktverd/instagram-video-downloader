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

## Dependency Analysis with dependency-cruiser

[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) is a powerful tool for visualizing and validating dependencies in JavaScript/TypeScript projects.

### Installation

Install as a dev dependency (recommended):

```bash
npm install --save-dev dependency-cruiser
```

If you encounter TypeScript version conflicts (like peer dependency issues between knip and dependency-cruiser), use one of these approaches:

```bash
# Option 1: Force install with legacy peer deps
npm install --save-dev dependency-cruiser --legacy-peer-deps

# Option 2: Force install
npm install --save-dev dependency-cruiser --force
```

### Setup

Initialize a configuration file:

```bash
npx dependency-cruiser --init
```

This creates a `.dependency-cruiser.js` file with default rules.

### Usage

Generate a dependency graph:

```bash
npx depcruise --include-only "^src" --output-type dot src | dot -T svg > dependency-graph.svg
```

Validate dependencies against rules:

```bash
npx depcruise --validate src
```

### Adding to package.json

```json
"scripts": {
  "deps:cruise": "depcruise --include-only \"^src\" --output-type dot src | dot -T svg > dependency-graph.svg",
  "deps:validate": "depcruise --validate src"
}
```

### Configuration

The `.dependency-cruiser.js` file can be customized to:

- Forbid circular dependencies
- Enforce architecture boundaries
- Prevent dependency on deprecated modules
- Restrict dependency reach
- And much more

Example rule to forbid circular dependencies:

```javascript
forbidden: [
  {
    name: 'no-circular',
    severity: 'error',
    comment: 'Circular dependencies are harmful',
    from: {},
    to: {
      circular: true,
    },
  },
];
```

dependency-cruiser helps maintain a clean architecture and prevents dependency issues before they grow into larger problems.

# VideoPipeline: Множественные входы и concat

## Основные изменения

- Теперь VideoPipeline работает с массивом входных файлов: `inputs: string[]`.
- Конкатенация (concat) возможна только к master-пайплайну (по умолчанию любой созданный VideoPipeline — master).
- Все фильтры (makeItRed, rotate и т.д.) и concat можно вызывать цепочкой.
- Метод run поддерживает как один, так и несколько входов.

## Пример использования

```ts
import {VideoPipeline} from 'src/sections/cloud-run/components/video/primitives-optimized';

const p1 = new VideoPipeline();
await p1.init('video1.mp4');
const p2 = new VideoPipeline();
await p2.init('video2.mp4');

// Конкатенация и фильтры
p1.concat(p2).makeItRed().rotate(90);
await p1.run('output.mp4');
```

- Если вызвать concat на не-мастер пайплайне — будет выброшена ошибка.
- После concat можно применять любые фильтры к итоговому видео.
- run создаёт итоговый файл с учётом всех входов и фильтров.

## Тесты

См. `src/tests/optimized-primitives-demo.test.ts` для примеров тестов на concat, фильтры и работу с несколькими входами.
