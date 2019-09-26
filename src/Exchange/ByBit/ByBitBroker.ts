import { IBroker } from "Model/Exchange/IBroker";
import { Position } from "Model/Contracts";
import { ByBitExchange } from "./ByBitExchange";

export class ByBitBroker implements IBroker {
    position: Position;
    currentOrders: string[];
    balance: number;

    constructor(private exchange: ByBitExchange) {

    }

    getOrder(): Readonly<any> {
        throw new Error("Method not implemented.");
    }
    marketOrder(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    limitOrder(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    conditionalOrder(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    exitPosition(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}