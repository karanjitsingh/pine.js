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

export interface IBroker {
    readonly balance: number;
    readonly leverage: number;



    marketOrder(): Promise<BrokerOrderResponse>;
    limitOrder(): Promise<BrokerOrderResponse>;
    conditionalOrder(): Promise<BrokerOrderResponse>;
    cancelOrder(orderId: string): Promise<BrokerOrderResponse>;

    updateLeverage(leverage: number): Promise<BrokerResponse>;

    exitPosition(): Promise<BrokerResponse>
}