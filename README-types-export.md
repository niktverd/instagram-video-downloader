# Instagram Video Downloader Types Export

This is a minimal example of how to export Zod types from the backend to the frontend using TypeScript declaration files (.d.ts).

## Structure

- `src/schemas/scenario.ts` - Contains Zod schemas that define the data structures
- `src/types/scenario.ts` - Contains TypeScript types inferred from the Zod schemas
- `generate-types.ts` - Script to generate TypeScript declaration files from Zod schemas
- `sharedTypes/` - Generated TypeScript declaration files

## How It Works

1. Backend defines data models using Zod schemas in `src/schemas/scenario.ts`
2. Type definitions are exported in `src/types/scenario.ts` using Zod's inference
3. The `generate-types.ts` script compiles TypeScript declaration files (.d.ts) from these types
4. The script automatically resolves path aliases (like `#src/models/types`) to relative paths
5. Generated types are placed in the `sharedTypes/` directory for use by frontend code

## Adding New Files to Export

To add new files for type export, simply add the file path to the `exportFiles` array in `generate-types.ts`:

```typescript
const exportFiles = [
  'src/types/scenario.ts',
  'src/schemas/scenario.ts',
  'src/models/types.ts',
  'src/db/account.ts',
  'src/db/scenario.ts',
  // Add your new file here
  'src/your/new/file.ts',
];
```

## Path Alias Resolution

The script automatically resolves path aliases in the generated types:

1. During compilation, it transforms import statements using a custom TypeScript transformer
2. After generation, it processes all .d.ts files to replace any remaining path aliases
3. For example, `import { Type } from '#src/models/types'` becomes `import { Type } from '../src/models/types'`

## Usage

### Generate Types

```bash
# Install dependencies first
npm install

# Generate types
npm run generate-types
```

### Frontend Development

```bash
# Import types in your frontend code
import { scenario } from '../sharedTypes';

// Use the types
const myScenario: scenario.ScenarioV4 = { ... };
```

## Benefits

- Single source of truth for data types (defined in Zod schemas)
- Automatic type checking for frontend and backend
- No need to manually keep frontend types in sync with backend changes
- Path aliases are automatically resolved to relative paths
- All types are exported from a central index.d.ts file

## Notes

This is a minimal example. In a real-world application, you might want to:

1. Add the type generation to your build pipeline
2. Create a more sophisticated schema organization
3. Add versioning to your API and types
