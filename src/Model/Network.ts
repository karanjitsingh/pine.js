import { IncomingHttpHeaders } from "http";

export interface INetwork {
    get(url: string): Promise<NetworkResponse>;
}

export interface NetworkResponse {
    requestId: number,
    status: number,
    headers: IncomingHttpHeaders,
    response: string,
    error: any
}

export type ApiCall<P, R> = (params: ApiContract<P, R>['Params']) => Promise<ApiContract<P, R>['Response']>;

export interface ApiContract<TParams, TResponse> {
    Params: TParams;
    Response: TResponse;
}

