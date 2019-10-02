import { ApiContract, INetwork, NetworkResponse } from "Model/Network";
import { ExchangeAuth } from "Model/Contracts";
import { ByBitContracts } from "./ByBitContracts";

export interface Response<TResult> {
    ret_code: number,
    ret_msg: string,
    ext_code: string,
    result: TResult,
    time_now: string
}

export class ByBitApi {
    constructor(private network: INetwork, private testnet: boolean) {
        
    }

    public ActiveOrders: {[id in keyof ByBitContracts]?: (params: ByBitContracts[id]['Params'], auth?: ExchangeAuth) => Promise<ByBitContracts[id]['Response']> } = {
        PlaceActiveOrder: (params: ByBitContracts['PlaceActiveOrder']['Params'], auth: ExchangeAuth) => {
            const url = this.testnet ? "https://api-testnet.bybit.com/open-api/order/create" : "https://api.bybit.com/open-api/order/create";
            return this.apiCall('post', url, params, auth);
        },

        Kline: (params: ByBitContracts['Kline']['Params']) => {
            const url = this.testnet ? "https://api-testnet.bybit.com/v2/public/kline/list" : "https://api.bybit.com/v2/public/kline/list";
            return this.apiCall('get', url, params);
        }
    }

    private apiCall<P, R>(method: keyof INetwork, url: string, params: ApiContract<P, R>['Params'], auth?: ExchangeAuth): Promise<ApiContract<P, R>['Response']> {
        let resolver: (response: R) => void;
        let rejector: (reason: any) => void;
        const promise = new Promise<R>((resolve, reject) => {resolver = resolve; rejector = reject;})
        
        switch(method) {
            case 'get':
                this.network[method](url, params as any).then((response: NetworkResponse) => {
                    resolver(JSON.parse(response.response) as R);
                }, (reason) => {
                    rejector(reason);
                });
                return promise;
            case 'post':
                break;
        }

        return Promise.reject(`Unsupported method: '${method}'`);
    }
}