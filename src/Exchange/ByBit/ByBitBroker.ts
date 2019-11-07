import { BrokerOrderResponse, BrokerResponse, IBroker, TradingStop, BrokerResponseSuccess, BrokerResponseFailure } from "Model/Exchange/IBroker";
import { DualDictionary } from "Model/Utils/DualDictionary";
import { ByBitExchange } from "./ByBitExchange";
import { Side, Int, IAccount, Position } from "Model/Contracts";
import { ByBitApiResponse } from "./ByBitContracts";

export class ByBitBroker implements IBroker {
    public get Account(): IAccount {
        return this.exchange.account;
    }

    public get OpenPosition(): Position | undefined {
        const position = this.exchange.account.Positions[this.exchange.symbol]
        if(position && !position.Closed) {
            return position;
        }
        return undefined
    };

    public get PositionPnL(): number | undefined {
        const position = this.OpenPosition;
        
        if(position) {
            return position.Size / position.EntryPrice * this.exchange.lastPrice;
        } else return undefined;
    }

    getRequestStatus(requestId: string): boolean {
        throw new Error("Method not implemented.");
    }

    marketOrder(side: Side, quantity: Int): Promise<BrokerOrderResponse> {
        const promise = this.exchange.api.PlaceActiveOrder({
            side,
            symbol: this.exchange.symbol,
            order_type: 'Market',
            price: this.exchange.lastPrice.toInt(),
            qty: quantity,
            time_in_force: 'ImmediateOrCancel',
        });
        
        return this.formBrokerResponse(promise, (response) => ({
            success: true,
            orderId: response.result.order_id
        })) as Promise<BrokerOrderResponse>;
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
        const promise = this.exchange.api.SetTradingStop({
            symbol: this.exchange.symbol,
            take_profit: stops.TakeProfit.toString(),
            stop_loss: stops.StopLoss.toString(),
            trailing_stop: stops.TrailingStop.toString()
        })

        return this.formBrokerResponse(promise);
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
            qty: position.Size.toInt(),
            time_in_force: 'ImmediateOrCancel',
            reduce_only: true
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