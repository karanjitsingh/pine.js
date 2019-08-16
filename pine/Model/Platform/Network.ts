export interface INetwork {
    get(url: string): Promise<NetworkResponse>;
}

export interface NetworkResponse {
    requestId: number,
    status: number,
    headers: string,
    response: string,
    error: any
}