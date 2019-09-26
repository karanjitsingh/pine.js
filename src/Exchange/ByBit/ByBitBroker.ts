import { IBroker, BrokerOrderResponse, BrokerResponse } from "Model/Exchange/IBroker";
import { ByBitExchange } from "./ByBitExchange";
import { Position } from "Model/Exchange/Exchange";
import { Order } from "Model/Exchange/Orders";

export class ByBitBroker implements IBroker {

    position: Position;
    currentOrders: string[];
    balance: number;

    public get leverage(): number { return this.exchange.leverage };

    constructor(private exchange: ByBitExchange) {

    }

    getOrder(): Readonly<Order> {
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

    updateLeverage(leverage: number): Promise<BrokerResponse> {
        throw new Error("Method not implemented.");
    }

    exitPosition(): Promise<BrokerOrderResponse> {
        throw new Error("Method not implemented.");
    }

}