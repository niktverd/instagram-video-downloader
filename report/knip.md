# Knip report

## Unused files (9)

* src/config/database.ts
* src/db/scripts/migrateToPostgres.ts
* src/db/services/UserService.ts
* src/sections/cloud-run/components/scenarios/CoverWithImage.ts
* src/sections/cloud-run/components/scenarios/LognVideoWithShortInjections.ts
* src/sections/cloud-run/components/scenarios/common.ts
* src/tests/requests/imitateInstagramMessageWebhook.ts
* src/utils/migrationHelper.ts
* src/utils/scenarios.ts

## Unused dependencies (4)

| Name                   | Location          | Severity |
| :--------------------- | :---------------- | :------- |
| typescript-json-schema | package.json:80:6 | error    |
| cors                   | package.json:60:6 | error    |
| uuid                   | package.json:81:6 | error    |
| pg                     | package.json:76:6 | error    |

## Unused devDependencies (2)

| Name        | Location          | Severity |
| :---------- | :---------------- | :------- |
| @types/cors | package.json:86:6 | error    |
| @types/uuid | package.json:95:6 | error    |

## Unlisted binaries (1)

| Name   | Location     | Severity |
| :----- | :----------- | :------- |
| podman | package.json | error    |

## Unused exports (10)

| Name            | Location                                                              | Severity |
| :-------------- | :-------------------------------------------------------------------- | :------- |
| getSvg          | src/sections/cloud-run/components/reels-creator/create-video.ts:22:17 | error    |
| config          | src/sections/cloud-run/components/reels-creator/create-video.ts:41:14 | error    |
| logStreamsInfo  | src/sections/cloud-run/components/video/ffprobe.helpers.ts:78:23      | error    |
| preprocessVideo | src/sections/chore/components/preprocess-video.ts:55:14               | error    |
| default         | src/models/InstagramMediaContainer.ts:49:8                            | error    |
| default         | src/models/InstagramLocation.ts:24:8                                  | error    |
| fetchDelete     | src/utils/fetchHelpers.ts:80:14                                       | error    |
| usaText         | src/config/places/usa.ts:55:14                                        | error    |
| default         | src/models/User.ts:59:8                                               | error    |
| default         | src/routes.ts:20:8                                                    | error    |

## Unused exported types (3)

| Name                   | Location                                                              | Severity |
| :--------------------- | :-------------------------------------------------------------------- | :------- |
| ColorCorrectionOptions | src/sections/cloud-run/components/video/primitives-optimized.ts:60:18 | error    |
| HueAdjustOptions       | src/sections/cloud-run/components/video/primitives-optimized.ts:75:18 | error    |
| BoxBlurOptions         | src/sections/cloud-run/components/video/primitives-optimized.ts:68:18 | error    |

## Unused exported enum members (8)

| Name                         | Location                    | Severity |
| :--------------------------- | :-------------------------- | :------- |
| INSTAGRAM_VIDEO_EVENTS_TIER2 | src/utils/constants.ts:11:5 | error    |
| INSTAGRAM_VIDEO_EVENTS_TIER3 | src/utils/constants.ts:12:5 | error    |
| INSTAGRAM_VIDEO_EVENTS_DEAD  | src/utils/constants.ts:13:5 | error    |
| INSTAGRAM_VIDEO_EVENTS       | src/utils/constants.ts:9:5  | error    |
| Timeout                      | src/types/enums.ts:29:5     | error    |
| RandomIndex                  | src/constants.ts:35:5       | error    |
| Min2                         | src/constants.ts:23:5       | error    |
| Min1                         | src/constants.ts:24:5       | error    |

## Duplicate exports (5)

| Name                      | Location                        | Severity |
| :------------------------ | :------------------------------ | :------- |
| InstagramLocation|default | src/models/InstagramLocation.ts | error    |
| PreparedVideo|default     | src/models/PreparedVideo.ts     | error    |
| Scenario|default          | src/models/Scenario.ts          | error    |
| Source|default            | src/models/Source.ts            | error    |
| User|default              | src/models/User.ts              | error    |

