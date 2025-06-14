import {FetchRoutes, Method, defaultHeaders} from './constants';
import {log} from './logging';

const API_ENDPOINT = process.env.MAIN_BACKEND_ENDPOINT;

const objectToSearchParams = (obj: Record<string, string | number | boolean | string[] | null>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
        } else if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    }
    return params;
};

const prepareFetchUrl = (
    route: FetchRoutes,
    query: Record<string, string | number | boolean | string[] | null>,
) => {
    const searchParams = objectToSearchParams(query);

    const url = `${API_ENDPOINT}/api${route}?${searchParams} `;
    // eslint-disable-next-line no-console
    log(url);

    return url;
};

type FetchGet = {
    route: FetchRoutes;
    query?: Record<string, string | number | boolean | string[] | null>;
};

export const fetchGet = async <T>({route, query = {}}: FetchGet) => {
    const response = await fetch(prepareFetchUrl(route, query), {
        headers: defaultHeaders,
        method: Method.Get,
    });
    const json = await response.json();

    return json as T;
};

type FetchPost = {
    route: FetchRoutes;
    query?: Record<string, string | number | boolean | string[]>;
    body?: unknown;
};

export const fetchPost = async ({route, query = {}, body = {}}: FetchPost) => {
    const response = await fetch(prepareFetchUrl(route, query), {
        headers: defaultHeaders,
        method: Method.Post,
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json;
};

export const fetchPatch = async ({route, query = {}, body = {}}: FetchPost) => {
    const response = await fetch(prepareFetchUrl(route, query), {
        headers: defaultHeaders,
        method: Method.Patch,
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json;
};

type FetchDelete = {
    route: FetchRoutes;
    query?: Record<string, string | number | boolean | null>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>;
};

export const fetchDelete = async ({route, query = {}, body = {}}: FetchDelete) => {
    const response = await fetch(prepareFetchUrl(route, query), {
        headers: defaultHeaders,
        method: Method.Delete,
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return json;
};
