import {z} from 'zod';

export const UserSchema = z
    .object({
        id: z.string(),
        email: z.string().email(),
        displayName: z.string().optional(),
        photoURL: z.string().optional(),
        providerData: z.any().optional(),
        providerId: z.any().optional(),
        password: z.string(),
    })
    .strict();
