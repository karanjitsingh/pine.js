import { DualDictionary } from "Model/Utils/DualDictionary";
import { Int, Side, IAccount, Position } from "Model/Contracts";

export type BrokerResponseSuccess<T> = {
    success: true;
} & T;

export interface BrokerResponseFailure {
    success: false;
    reason: string;
}

export type BrokerResponse<T = {}> = BrokerResponseSuccess<T> | BrokerResponseFailure;
export type BrokerOrderResponse = BrokerResponse<{ orderId: string }>;

export interface TradingStop {
    TakeProfit?: number;
    StopLoss?: number;
    TrailingStop?: number;
}

export interface IBroker {
    readonly Account: IAccount;
    readonly OpenPosition: Position | undefined;
    readonly PositionPnL: number | undefined;

    getRequestStatus(requestId: string): boolean;

    marketOrder(side: Side, quantity: Int): Promise<BrokerOrderResponse>;
    limitOrder(): Promise<BrokerOrderResponse>;
    conditionalOrder(): Promise<BrokerOrderResponse>;
    cancelOrder(orderId: string): Promise<BrokerOrderResponse>;

    setStop(stops: TradingStop): Promise<BrokerResponse>;

    updateLeverage(leverage: number): Promise<BrokerResponse>;

    closePosition(): Promise<BrokerResponse>;
}