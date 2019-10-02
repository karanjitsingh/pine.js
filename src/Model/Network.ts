import { IncomingHttpHeaders } from "http";
import { Dictionary } from "./Contracts";

export interface INetwork {
    get(url: string, params: Dictionary<string>): Promise<NetworkResponse>;
    post(url: string, params: Dictionary<string>, body: string): Promise<NetworkResponse>;
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

