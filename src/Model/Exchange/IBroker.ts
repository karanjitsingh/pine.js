import { DualDictionary } from "Model/Utils/DualDictionary";

export interface BrokerResponseSuccess {
    success: true;
}

export interface BrokerResponseFailure {
    success: false;
    reason: string;
}

export interface BrokerOrderResponseSuccess extends BrokerResponseSuccess {
    orderId: string;
}

export type BrokerResponse = BrokerResponseSuccess | BrokerResponseFailure;
export type BrokerOrderResponse = BrokerOrderResponseSuccess | BrokerResponseFailure;

export interface TradingStop {
    TakeProfit: number;
    StopLoss: number;
    TrailingStop: number;
}

export interface IBroker {
    readonly balance: number;
    readonly leverage: number;
    readonly requestOrderMap: DualDictionary;
    readonly requestPositionMap: DualDictionary;

    getRequestStatus(requestId: string): boolean; 

    marketOrder(): Promise<BrokerOrderResponse>;
    limitOrder(): Promise<BrokerOrderResponse>;
    conditionalOrder(): Promise<BrokerOrderResponse>;
    cancelOrder(orderId: string): Promise<BrokerOrderResponse>;

    setStop(stops: TradingStop): Promise<BrokerResponse>;

    updateLeverage(leverage: number): Promise<BrokerResponse>;

    exitPosition(): Promise<BrokerResponse>
}