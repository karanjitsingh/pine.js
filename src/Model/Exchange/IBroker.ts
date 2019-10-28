import { DualDictionary } from "Model/Utils/DualDictionary";

export type BrokerResponseSuccess<T> = {
    success: true;
} & T;

export interface BrokerResponseFailure {
    success: false;
    reason: string;
}

export type BrokerResponse<T = {}> = BrokerResponseSuccess<T> | BrokerResponseFailure;
export type BrokerOrderResponse = BrokerResponse<{ orderId: string }>

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

    closePosition(): Promise<BrokerResponse>
}