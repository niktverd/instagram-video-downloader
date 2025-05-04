// import {addBannerInTheEnd} from './AddBannerInTheEnd';
import {z} from 'zod';

import {addBannerInTheEndUnique} from './AddBannerInTheEndUnique';
// import {coverWithImage} from './CoverWithImage';
// import {prepareLongVideoWithShortInjections} from './LognVideoWithShortInjections';
// import {shortify} from './Shortify';
import {shortifyUnique} from './ShortifyUnique';

import {
    ScenarioType,
    // scenarioAddBannerAtTheEndSchema,
    scenarioAddBannerAtTheEndUniqueSchema,
    // scenarioCoverWithImageSchema,
    // scenarioLongVideoWithInjectionsSchema,
    // scenarioShortifySchema,
    scenarioShortifyUniqueSchema,
} from '#src/schemas/scenario';

export const ScenarioMap: Record<
    ScenarioType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {scenario: (args: any) => Promise<string>; schema: z.ZodSchema}
> = {
    // [ScenarioType.ScenarioAddBannerAtTheEnd]: {
    //     scenario: addBannerInTheEnd,
    //     schema: scenarioAddBannerAtTheEndSchema,
    // },
    [ScenarioType.ScenarioAddBannerAtTheEndUnique]: {
        scenario: addBannerInTheEndUnique,
        schema: scenarioAddBannerAtTheEndUniqueSchema,
    },
    // [ScenarioType.ScenarioCoverWithImage]: {
    //     scenario: coverWithImage,
    //     schema: scenarioCoverWithImageSchema,
    // },
    // [ScenarioType.ScenarioLongVideoWithInjections]: {
    //     scenario: prepareLongVideoWithShortInjections,
    //     schema: scenarioLongVideoWithInjectionsSchema,
    // },
    // [ScenarioType.ScenarioShortify]: {
    //     scenario: shortify,
    //     schema: scenarioShortifySchema,
    // },
    [ScenarioType.ScenarioShortifyUnique]: {
        scenario: shortifyUnique,
        schema: scenarioShortifyUniqueSchema,
    },
};
