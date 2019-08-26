import { IBroker } from "Model/Exchange/IBroker";

export class ByBitBroker implements IBroker {
    enterLong(leverage: number, qty: number): Promise<import("../../Model/Data/Trading").OpenTrade> {
        throw new Error("Method not implemented.");
    }    enterShort(leverage: number, qty: number): Promise<import("../../Model/Data/Trading").OpenTrade> {
        throw new Error("Method not implemented.");
    }
    exitTrade(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentPosition(): Promise<import("../../Model/Data/Trading").OpenTrade> {
        throw new Error("Method not implemented.");
    }


}