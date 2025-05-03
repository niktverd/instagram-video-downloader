# Unused Code Identified by Knip

This document contains a list of unused code identified by the knip static analysis tool. These items could potentially be removed to improve code maintainability.

## Unused Exports

| Export | File | Line |
|--------|------|------|
| `usaText` | src/config/places/usa.ts | 55:14 |
| `preprocessVideo` | src/sections/chore/components/preprocess-video.ts | 53:14 |
| `getSvg` (function) | src/sections/cloud-run/components/reels-creator/create-video.ts | 22:17 |
| `config` | src/sections/cloud-run/components/reels-creator/create-video.ts | 41:14 |

## Unused Enum Members

| Enum Member | Enum | File | Line |
|-------------|------|------|------|
| `Min2` | DelayMS | src/constants.ts | 22:5 |
| `RandomIndex` | MediaPostModelFilters | src/constants.ts | 34:5 |
| `ScenarioAddBannerAtTheEnd1` | ScenarioName | src/types/scenario.ts | 10:5 |
| `ScenarioAddBannerAtTheEnd2` | ScenarioName | src/types/scenario.ts | 11:5 |

## Notes

Before removing any of these items, please consider:
1. Is this code intended for future use?
2. Is it used in a way that static analysis can't detect (e.g., dynamic imports or reflective usage)?
3. Is it required for backwards compatibility with external systems?

## Dependencies Already Removed

| Dependency | Type |
|------------|------|
| node-cron | dependency |
| @types/node-cron | devDependency |

When ready to clean up unused code, you can run:
```
npm run knip:fix
```
