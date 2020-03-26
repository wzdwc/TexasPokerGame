import { HttpMethod } from 'urllib';

/**
 * @description User-Service abstractions
 */
export interface IFetchOptions {
    method?: string;
    url: string;
    body: object;
    head?: object;
    timeout?: number;
    headers?: object;
    type?: HttpMethod;
    ssjToken: string;
}
