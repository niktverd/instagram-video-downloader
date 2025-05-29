export type IResponse<T> = Promise<{
    result: T;
    code?: number;
}>;
