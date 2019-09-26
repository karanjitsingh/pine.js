import { OpenTrade, Position } from "Model/Contracts";

export interface IBroker {
    readonly position: Position;
    readonly currentOrders: string[];
    readonly balance: number;

    getOrder(): Readonly<any>;
    marketOrder(): Promise<any>;
    limitOrder(): Promise<any>;
    conditionalOrder(): Promise<any>;

    exitPosition(): Promise<any>
}