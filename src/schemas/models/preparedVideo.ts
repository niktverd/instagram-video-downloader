import {z} from 'zod';

import {AccountSchema} from './account';
import {ScenarioSchema} from './scenario';
import {SourceSchema} from './source';

export const PreparedVideoSchema = z.object({
    id: z.number(),
    firebaseUrl: z.string(),
    duration: z.number().optional(),
    scenarioId: z.number(),
    sourceId: z.number(),
    accountId: z.number(),
    scenario: ScenarioSchema.optional(),
    source: SourceSchema.optional(),
    account: AccountSchema.optional(),
});
