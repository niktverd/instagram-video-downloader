import {z} from 'zod';

import {AccountSchema} from './account';
import {createEntitySchema} from './base';
import {ScenarioSchema} from './scenario';
import {SourceSchema} from './source';

export const PreparedVideoSchema = createEntitySchema({
    firebaseUrl: z.string(),
    duration: z.number().optional(),
    scenarioId: z.number(),
    sourceId: z.number(),
    accountId: z.number(),
    scenario: ScenarioSchema.optional(),
    source: SourceSchema.optional(),
    account: AccountSchema.optional(),
}).strict();
