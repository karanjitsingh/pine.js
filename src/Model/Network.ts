import { IncomingHttpHeaders } from "http";

export interface INetwork {
    Request: {
        get(url: string, params: any): Promise<NetworkResponse>;
        post(url: string, params: any, body: any): Promise<NetworkResponse>;
    }
}

export interface NetworkResponse {
    requestId: number,
    status: number,
    headers: IncomingHttpHeaders,
    response: string,
    error: any
}

export interface ApiContract<TParams, TResponse> {
    Params: TParams;
    Response: TResponse;
}

