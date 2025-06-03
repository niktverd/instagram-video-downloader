import {z} from 'zod';

export const BaseEntitySchema = z.object({
    id: z.number(),
    createdAt: z.string().or(z.date()).optional(),
    updatedAt: z.string().or(z.date()).optional(),
});

export const createEntitySchema = <T extends z.ZodRawShape>(shape: T) =>
    BaseEntitySchema.extend(shape);
