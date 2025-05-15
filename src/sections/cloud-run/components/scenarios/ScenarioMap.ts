// import {addBannerInTheEnd} from './AddBannerInTheEnd';
import {z} from 'zod';

import {addBannerInTheEndUnique} from './AddBannerInTheEndUnique';
// import {coverWithImage} from './CoverWithImage';
// import {prepareLongVideoWithShortInjections} from './LognVideoWithShortInjections';
// import {shortify} from './Shortify';
import {coverWithGreenScenario} from './CoverWithGreen';
import {shortifyUnique} from './ShortifyUnique';
import {ScenarioFunction} from './types';

import {
    // ScenarioType,
    // scenarioAddBannerAtTheEndSchema,
    scenarioAddBannerAtTheEndUniqueSchema,
    scenarioCoverWithGreenUniqueSchema,
    // scenarioCoverWithImageSchema,
    // scenarioLongVideoWithInjectionsSchema,
    // scenarioShortifySchema,
    scenarioShortifyUniqueSchema,
} from '#src/schemas/scenario';
import {ScenarioType} from '#src/types/enums';

export const ScenarioMap: Record<ScenarioType, {scenario: ScenarioFunction; schema: z.ZodSchema}> =
    {
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
        [ScenarioType.ScenarioCoverWithGreenUnique]: {
            scenario: coverWithGreenScenario,
            schema: scenarioCoverWithGreenUniqueSchema,
        },
    };
