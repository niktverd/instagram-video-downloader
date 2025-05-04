import {z} from 'zod';

import {
    // scenarioAddBannerAtTheEndSchema,
    scenarioAddBannerAtTheEndUniqueSchema,
    scenarioBaseSchema,
    // scenarioCoverWithImageSchema,
    // scenarioLongVideoWithInjectionsSchema,
    // scenarioShortifySchema,
    scenarioShortifyUniqueSchema,
} from '#src/schemas/scenario';

export enum ScenarioName { // deprecated
    // ScenarioAddBannerAtTheEnd1 = 'add-banner-at-the-end-1',
    // ScenarioAddBannerAtTheEnd2 = 'add-banner-at-the-end-2',
    ScenarioAddBannerAtTheEndUnique = 'add-banner-at-the-end-unique',
    ScenarioShortifyUnique = 'shortify-unique',
    // ScenarioShortify = 'shortify',
}

export type ScenarioBase = z.infer<typeof scenarioBaseSchema>;
// export type ScenarioAddBannerAtTheEnd = z.infer<typeof scenarioAddBannerAtTheEndSchema>;
export type ScenarioAddBannerAtTheEndUnique = z.infer<typeof scenarioAddBannerAtTheEndUniqueSchema>;
// export type ScenarioShortify = z.infer<typeof scenarioShortifySchema>;
export type ScenarioShortifyUnique = z.infer<typeof scenarioShortifyUniqueSchema>;
// export type ScenarioCoverWithImage = z.infer<typeof scenarioCoverWithImageSchema>;
// export type ScenarioLongVideoWithInjections = z.infer<typeof scenarioLongVideoWithInjectionsSchema>;

export type ScenarioV4 = ScenarioAddBannerAtTheEndUnique | ScenarioShortifyUnique;
// | ScenarioCoverWithImage;
