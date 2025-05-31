import {z} from 'zod';

import {queryToBoolean, queryToNumberArray} from '#src/schemas/helpers';

export const zodOptionalNumberArray = () =>
    z
        .preprocess(queryToNumberArray, z.array(z.number()))
        .optional()
        .transform((x) => (x === undefined ? undefined : (x as number[]))) as unknown as z.ZodType<
        number[] | undefined
    >;

export const zodOptionalBoolean = () =>
    z
        .preprocess(queryToBoolean, z.boolean())
        .optional()
        .transform((x) => (x === undefined ? undefined : (x as boolean))) as unknown as z.ZodType<
        boolean | undefined
    >;
