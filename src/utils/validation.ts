import {z} from 'zod';

export const validate = <T>(
    data: unknown,
    schema: z.ZodSchema<T>,
): {
    success: boolean;
    data?: T;
    error?: string;
} => {
    try {
        const validData = schema.parse(data);
        return {
            success: true,
            data: validData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
            };
        }
        return {
            success: false,
            error: 'Unexpected validation error',
        };
    }
};
