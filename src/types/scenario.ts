import {z} from 'zod';

import {
    CreateScenarioParamsSchema as _CreateScenarioParamsSchema,
    DeleteScenarioParamsSchema as _DeleteScenarioParamsSchema,
    GetAllScenariosParamsSchema as _GetAllScenariosParamsSchema,
    GetScenarioByIdParamsSchema as _GetScenarioByIdParamsSchema,
    GetScenarioBySlugParamsSchema as _GetScenarioBySlugParamsSchema,
    UpdateScenarioParamsSchema as _UpdateScenarioParamsSchema,
} from '#schemas/handlers/scenario';
import {ScenarioSchema} from '#schemas/models/scenario';
import {
    // scenarioAddBannerAtTheEndSchema,
    scenarioAddBannerAtTheEndUniqueSchema,
    scenarioBaseSchema,
    scenarioCoverWithGreenUniqueSchema,
    // scenarioCoverWithImageSchema,
    // scenarioLongVideoWithInjectionsSchema,
    // scenarioShortifySchema,
    scenarioShortifyUniqueSchema,
} from '#src/schemas/scenario';

export type IScenario = z.infer<typeof ScenarioSchema>;

export type ScenarioBase = z.infer<typeof scenarioBaseSchema>;
// export type ScenarioAddBannerAtTheEnd = z.infer<typeof scenarioAddBannerAtTheEndSchema>;
export type ScenarioAddBannerAtTheEndUnique = z.infer<typeof scenarioAddBannerAtTheEndUniqueSchema>;
// export type ScenarioShortify = z.infer<typeof scenarioShortifySchema>;
export type ScenarioShortifyUnique = z.infer<typeof scenarioShortifyUniqueSchema>;
export type ScenarioCoverWithGreenUnique = z.infer<typeof scenarioCoverWithGreenUniqueSchema>;
// export type ScenarioLongVideoWithInjections = z.infer<typeof scenarioLongVideoWithInjectionsSchema>;

export type ScenarioV4 =
    | ScenarioAddBannerAtTheEndUnique
    | ScenarioShortifyUnique
    | ScenarioCoverWithGreenUnique;
// | ScenarioCoverWithImage;

// DB Types
export type CreateScenarioParams = Omit<IScenario, 'id'>;
export type CreateScenarioResponse = IScenario;

export type GetScenarioByIdParams = z.infer<typeof _GetScenarioByIdParamsSchema>;
export type GetScenarioByIdResponse = IScenario;

export type GetScenarioBySlugParams = z.infer<typeof _GetScenarioBySlugParamsSchema>;
export type GetScenarioBySlugResponse = IScenario;

export type GetAllScenariosParams = z.infer<typeof _GetAllScenariosParamsSchema>;
export type GetAllScenariosResponse = IScenario[];

export type UpdateScenarioParams = z.infer<typeof _UpdateScenarioParamsSchema>;
export type UpdateScenarioResponse = IScenario;

export type DeleteScenarioParams = z.infer<typeof _DeleteScenarioParamsSchema>;
export type DeleteScenarioResponse = number;
