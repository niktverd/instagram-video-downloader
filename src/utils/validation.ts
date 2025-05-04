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

// enum Status {
//     Pending = 'pending',
//     Approved = 'approved',
//     Rejected = 'rejected',
// }

// const StatusSchema = z.nativeEnum(Status);

// const itemSchema = z
//     .object({
//         status: StatusSchema,
//     })
//     .strict();

// const complexSchema = z
//     .object({
//         url: z.string().url('Invalid URL format'),
//         name: z.string().min(1, 'Name is required'),
//         item: itemSchema,
//         items: z.array(itemSchema),
//     })
//     .strict();

// type ComplexSchema = z.infer<typeof complexSchema>;

// const validateUrl = (inputData: ComplexSchema) => {
//     return validate<ComplexSchema>(inputData, complexSchema);
// };

// const data: any = {
//     url: 'https://example.com',
//     name: '123',
//     item: {status: Status.Pending},
//     items: [{status: Status.Approved}, {status: Status.Rejected}],
// };

// console.log(validateUrl(data));
