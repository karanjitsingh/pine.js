import { BrokerOrderResponse, BrokerResponse, IBroker, TradingStop, BrokerResponseSuccess, BrokerResponseFailure } from "Model/Exchange/IBroker";
import { DualDictionary } from "Model/Utils/DualDictionary";
import { ByBitExchange } from "./ByBitExchange";
import { Side, Int } from "Model/Contracts";
import { ByBitApiResponse } from "./ByBitContracts";

export class ByBitBroker implements IBroker {
    balance: number;
    leverage: number;
    requestOrderMap: DualDictionary;
    requestPositionMap: DualDictionary;

    getRequestStatus(requestId: string): boolean {
        throw new Error("Method not implemented.");
    }

    marketOrder(): Promise<BrokerOrderResponse> {
        throw new Error("Method not implemented.");
    }

    limitOrder(): Promise<BrokerOrderResponse> {
        throw new Error("Method not implemented.");
    }

    conditionalOrder(): Promise<BrokerOrderResponse> {
        throw new Error("Method not implemented.");
    }

    cancelOrder(orderId: string): Promise<BrokerOrderResponse> {
        throw new Error("Method not implemented.");
    }

    setStop(stops: TradingStop): Promise<BrokerResponse> {
        

        throw new Error("Method not implemented.");
    }

    updateLeverage(leverage: Int): Promise<BrokerResponse> {
        const promise = this.exchange.api.ChangeUserLeverage({
            symbol: this.exchange.symbol,
            leverage: leverage.toString()
        });

        return this.formBrokerResponse(promise);
    }

    /**
     * Creates a market order to close the position
     */
    closePosition(): Promise<BrokerOrderResponse> {
        const position = this.exchange.account.Positions[this.exchange.symbol];

        if (position.Closed || position.Side == "None") {
            return Promise.reject('No open position');
        }

        const closeSide: Side = position.Side == "Buy" ? "Sell" : "Buy";


        const promise = this.exchange.api.PlaceActiveOrder({
            side: closeSide,
            symbol: this.exchange.symbol,
            order_type: 'Market',
            price: this.exchange.lastPrice.toInt(),
            qty: this.exchange.lastPrice.toInt(),
            time_in_force: 'ImmediateOrCancel'
        })

        return this.formBrokerResponse(promise, (response) => ({
            success: true,
            orderId: response.result.order_id
        })) as Promise<BrokerOrderResponse>;
    }

    private formBrokerResponse<S extends ByBitApiResponse<any>, T = {}>(call: Promise<S>, getSuccessResponse?: (response: S) => BrokerResponse<T>): Promise<BrokerResponse<T>> {
        // TODO log failures
        
        return new Promise((resolve) => {

            call.then((response) => {
                if (response.ret_code == 0) {
                    if(getSuccessResponse) {
                        resolve(getSuccessResponse(response));
                    } else {
                        resolve({
                            success: true,
                        } as BrokerResponseSuccess<T>);
                    }
                } else {
                    resolve({
                        success: false,
                        reason: response.ret_msg
                    } as BrokerResponseFailure)
                }
            }, (reason) => {
                resolve({
                    success: false,
                    reason
                } as BrokerResponseFailure);
            });
        })

    }

    constructor(private exchange: ByBitExchange) { }

}