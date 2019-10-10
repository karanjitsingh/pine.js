import { Order, Position } from "Model/Contracts";
import { BrokerOrderResponse, BrokerResponse, IBroker, TradingStop } from "Model/Exchange/IBroker";
import { ByBitExchange } from "./ByBitExchange";
import { DualDictionary } from "Model/Utils/DualDictionary"

export class ByBitBroker implements IBroker {
    balance: number;    leverage: number;
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
    exitPosition(): Promise<BrokerResponse> {
        throw new Error("Method not implemented.");
    }

    constructor(private exchange: ByBitExchange) {
        
    }

}