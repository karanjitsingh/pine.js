import { IBroker } from "Model/Exchange/IBroker";
import { OpenTrade } from "Model/Data/Trading";

export class BacktestBroker implements IBroker {
    enterLong(leverage: number, qty: number): Promise<OpenTrade> {
        throw new Error("Method not implemented.");
    }
    
    enterShort(leverage: number, qty: number): Promise<OpenTrade> {
        throw new Error("Method not implemented.");
    }
    exitTrade(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentPosition(): Promise<OpenTrade> {
        throw new Error("Method not implemented.");
    }


}