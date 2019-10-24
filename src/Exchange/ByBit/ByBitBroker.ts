import { BrokerOrderResponse, BrokerResponse, IBroker, TradingStop } from "Model/Exchange/IBroker";
import { DualDictionary } from "Model/Utils/DualDictionary";
import { ByBitExchange } from "./ByBitExchange";
import { Side } from "Model/Contracts";

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

    updateLeverage(leverage: number): Promise<BrokerResponse> {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a market order to close the position
     */
    closePosition(): Promise<BrokerResponse> {
        const position = this.exchange.account.Positions[this.exchange.symbol];

        if(position.Closed || position.Side == "None") {
            return Promise.reject('No open position');
        }

        const closeSide: Side = position.Side == "Buy" ? "Sell" : "Buy";

        console.log(this.exchange.lastPrice)

        this.exchange.api.PlaceActiveOrder({
            side: closeSide,
            symbol: this.exchange.symbol,
            order_type: 'Market',
            price: this.exchange.lastPrice.toInt(),
            qty: this.exchange.lastPrice.toInt(),
            time_in_force: 'ImmediateOrCancel'
        }).then((x) => {
            console.log("resolve", x)
        }, (x) => {console.log("reject", x)});

    }

    constructor(private exchange: ByBitExchange) {

    }

}