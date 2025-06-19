import {z} from 'zod';

import {ScenarioSchema} from './models';

import {ScenarioType} from '#src/types/enums';

export const scenarioBaseSchema = ScenarioSchema.strip();

// export const scenarioAddBannerAtTheEndSchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioAddBannerAtTheEnd),
//     extraBannerUrl: z.string(),
// });

export const scenarioAddBannerAtTheEndUniqueSchema = scenarioBaseSchema.extend({
    type: z.literal(ScenarioType.ScenarioAddBannerAtTheEndUnique),
    options: z.object({
        extraBannerUrl: z.string(),
        extraBannerUrls: z.array(z.string()),
    }),
});

// export const scenarioShortifySchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioShortify),
//     extraBannerUrls: z.array(z.string()),
//     minDuration: z.number(),
//     maxDuration: z.number(),
// });

export const scenarioShortifyUniqueSchema = scenarioBaseSchema.extend({
    type: z.literal(ScenarioType.ScenarioShortifyUnique),
    options: z.object({
        minDuration: z.number(),
        maxDuration: z.number(),
        extraBannerUrls: z.array(z.string()),
    }),
});

// export const scenarioCoverWithImageSchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioCoverWithImage),
//     imageUrl: z.string(),
//     imageTop: z.number(),
//     imageLeft: z.number(),
//     imageWidth: z.number(),
//     imageHeight: z.number(),
//     videoTop: z.number(),
//     videoLeft: z.number(),
//     videoWidth: z.number(),
//     videoHeight: z.number(),
// });

// export const scenarioLongVideoWithInjectionsSchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioLongVideoWithInjections),
//     adsBannerUrl: z.string(),
//     startBannerUrl: z.string(),
//     injections: z.array(z.string()),
//     limit: z.number(),
// });

export const scenarioCoverWithGreenUniqueSchema = scenarioBaseSchema.extend({
    type: z.literal(ScenarioType.ScenarioCoverWithGreenUnique),
    options: z.object({
        greenVideoUrls: z.array(z.string()),
        whereToPutGreen: z.enum(['start', 'middle', 'end']),
        loopGreen: z.enum(['once', 'loop', 'random']),
    }),
});
