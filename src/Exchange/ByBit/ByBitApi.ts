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

    public ActiveOrders: {[id in keyof ByBitContracts]?: (auth: ExchangeAuth, params: ByBitContracts[id]['Params']) => Promise<ByBitContracts[id]['Response']> } = {
        PlaceActiveOrder: (auth: ExchangeAuth, params: ByBitContracts['PlaceActiveOrder']['Params']) => {
            const url = this.testnet ? "https://api-testnet.bybit.com/open-api/order/create" : "https://api.bybit.com/open-api/order/create";
            return this.apiCall('post', url, auth, params);
        }
    }

    private apiCall<P, R>(method: keyof INetwork['Request'], url: string, auth: ExchangeAuth, params: ApiContract<P, R>['Params']): Promise<ApiContract<P, R>['Response']> {
        switch(method) {
            case 'get':
                this.network.Request[method](url, params).then((response: NetworkResponse) => {
                    return JSON.parse(response.response) as any;
                });
            case 'post':
                break;
        }

        throw new Error(`Unsupported method: '${method}'`);
    }
}