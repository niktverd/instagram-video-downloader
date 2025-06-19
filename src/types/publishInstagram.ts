import {z} from 'zod';

import {
    PublishIntagramV4ResponseSchema,
    PublishIntagramV4Schema,
} from '#src/types/schemas/handlers/publishInstagram';

export type PublishIntagramV4PostParams = z.infer<typeof PublishIntagramV4Schema>;
export type PublishIntagramV4PostResponse = z.infer<typeof PublishIntagramV4ResponseSchema>;
