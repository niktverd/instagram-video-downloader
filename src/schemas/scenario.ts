import {z} from 'zod';

export enum ScenarioType {
    // ScenarioAddBannerAtTheEnd = 'ScenarioAddBannerAtTheEnd',
    ScenarioAddBannerAtTheEndUnique = 'ScenarioAddBannerAtTheEndUnique',
    // ScenarioShortify = 'ScenarioShortify',
    ScenarioShortifyUnique = 'ScenarioShortifyUnique',
    // ScenarioCoverWithImage = 'ScenarioCoverWithImage',
    // ScenarioLongVideoWithInjections = 'ScenarioLongVideoWithInjections',
}

export const scenarioBaseSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        onlyOnce: z.boolean(),
        enabled: z.boolean(),
        texts: z.record(z.string(), z.array(z.string())),
        type: z.nativeEnum(ScenarioType),
        copiedFrom: z.string().optional(),
    })
    .strict();

// export const scenarioAddBannerAtTheEndSchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioAddBannerAtTheEnd),
//     extraBannerUrl: z.string(),
// });

export const scenarioAddBannerAtTheEndUniqueSchema = scenarioBaseSchema.extend({
    type: z.literal(ScenarioType.ScenarioAddBannerAtTheEndUnique),
    extraBannerUrl: z.string(),
    extraBannerUrls: z.array(z.string()),
});

// export const scenarioShortifySchema = scenarioBaseSchema.extend({
//     type: z.literal(ScenarioType.ScenarioShortify),
//     extraBannerUrls: z.array(z.string()),
//     minDuration: z.number(),
//     maxDuration: z.number(),
// });

export const scenarioShortifyUniqueSchema = scenarioBaseSchema.extend({
    type: z.literal(ScenarioType.ScenarioShortifyUnique),
    minDuration: z.number(),
    maxDuration: z.number(),
    extraBannerUrls: z.array(z.string()),
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
