import * as crypto from 'crypto';
import { ExchangeAuth } from "Model/Contracts";
import { ApiContract, INetwork, NetworkResponse } from "Model/Network";
import { ByBitContracts } from "./ByBitContracts";

export interface Response<TResult> {
    ret_code: number,
    ret_msg: string,
    ext_code: string,
    result: TResult,
    time_now: string
}
export type Api = { [id in keyof ByBitContracts]?: (params: ByBitContracts[id]['Params'], auth?: ExchangeAuth) => Promise<ByBitContracts[id]['Response']> };

export class ByBitApi implements Api {
    constructor(private network: INetwork, private testnet: boolean) { }

    public PlaceActiveOrder = (params: ByBitContracts['PlaceActiveOrder']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/open-api/order/create" : "https://api.bybit.com/open-api/order/create";
        return this.apiCall<ByBitContracts['PlaceActiveOrder']>('post', url, params, auth);
    }

    public Kline = (params: ByBitContracts['Kline']['Params']) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/v2/public/kline/list" : "https://api.bybit.com/v2/public/kline/list";
        return this.apiCall<ByBitContracts['Kline']>('get', url, params);
    }

    public GetActiveOrder = (params: ByBitContracts['GetActiveOrder']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/open-api/order/list" : "https://api.bybit.com/open-api/order/list";
        return this.apiCall<ByBitContracts['GetActiveOrder']>('get', url, params, auth);
    }

    public GetConditionalOrder = (params: ByBitContracts['GetConditionalOrder']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/open-api/stop-order/list" : "https://api.bybit.com/open-api/stop-order/list";
        return this.apiCall<ByBitContracts['GetConditionalOrder']>('get', url, params, auth);
    }

    public MyPosition = (params: ByBitContracts['MyPosition']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/position/list" : "https://api.bybit.com/position/list";
        return this.apiCall<ByBitContracts['MyPosition']>('get', url, params, auth);
    }

    public GetWalletFundRecords = (params: ByBitContracts['GetWalletFundRecords']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/open-api/wallet/fund/records" : "https://api.bybit.com/open-api/wallet/fund/records";
        return this.apiCall<ByBitContracts['GetWalletFundRecords']>('get', url, params, auth);
    }

    public UserLeverage = (params: ByBitContracts['UserLeverage']['Params'], auth: ExchangeAuth) => {
        const url = this.testnet ? "https://api-testnet.bybit.com/user/leverage" : "https://api.bybit.com/user/leverage";
        return this.apiCall<ByBitContracts['UserLeverage']>('get', url, params, auth);
    }

    private apiCall<Contract extends ApiContract<Contract['Params'], Contract['Response']>>(method: keyof INetwork, url: string, params: Contract['Params'], auth?: ExchangeAuth): Promise<Contract['Response']> {

        if (!params || !(params instanceof Object)) {
            params = {};
        }

        return new Promise<Contract['Response']>((resolve, reject) => {
            this.apiNetworkCall(method, url, params, auth).then((response: NetworkResponse) => {
                resolve(JSON.parse(response.response) as Contract['Response']);
            }, (reason) => {
                reject(reason);
            });;
        });
    }

    private apiNetworkCall<Contract extends ApiContract<Contract['Params'], Contract['Response']>>(method: keyof INetwork, url: string, params: Contract['Params'], auth?: ExchangeAuth): Promise<NetworkResponse> {
        switch (method) {
            case 'get':
                return this.network[method](url, auth ? this.getSignedParam(auth, params) : params);
            case 'post':
                return this.network[method](url, {
                    "Content-Type": "application/json"
                }, JSON.stringify(auth ? this.getSignedParam(auth, params) : params));
        }

        return Promise.reject(`Unsupported method: '${method}'`);
    }

    private getSignedParam(auth: ExchangeAuth, params: any): Object {
        params['timestamp'] = new Date().getTime() + 2000;
        params['api_key'] = auth.ApiKey;

        const orderedParams: any = {}

        let paramstr = "";

        Object.keys(params).sort().forEach((key: string) => {
            orderedParams[key] = params[key];

            if (paramstr) {
                paramstr += "&";
            }

            paramstr += key + "=" + params[key];
        });

        orderedParams['sign'] = crypto.createHmac('sha256', auth.Secret).update(paramstr).digest('hex');

        return orderedParams;
    }
}