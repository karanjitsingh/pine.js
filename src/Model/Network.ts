import { IncomingHttpHeaders } from "http";

export interface INetwork {
    get(url: string, params: Object): Promise<NetworkResponse>;
    post(url: string, params: Object, body: string): Promise<NetworkResponse>;
}

export interface NetworkResponse {
    requestId: number,
    status: number,
    headers: IncomingHttpHeaders,
    response: string,
    error: any
}

export interface ApiContract<TParams extends Object, TResponse extends Object> {
    Params: TParams;
    Response: TResponse;
}

