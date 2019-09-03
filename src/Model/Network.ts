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