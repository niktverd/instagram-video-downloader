import {TransactionOrKnex} from 'objection';

export type IResponse<T> = Promise<{
    result: T;
    code?: number;
}>;

export type ApiFunctionPrototype<T, R> = (args: T, trx: TransactionOrKnex) => IResponse<R>;
