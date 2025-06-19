import {z} from 'zod';

import {createEntitySchema} from './base';

export const UserSchema = createEntitySchema({
    email: z.string().email(),
    displayName: z.string().optional(),
    photoURL: z.string().optional(),
    providerData: z.any().optional(),
    providerId: z.any().optional(),
    password: z.string(),
}).strict();
