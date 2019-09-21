import { OpenTrade } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";

export class BacktestBroker implements IBroker {
    BrokerBusy: boolean;

    enterLong(leverage: number, qty: number): boolean {
        throw new Error("Method not implemented.");
    }

    enterShort(leverage: number, qty: number): boolean {
        throw new Error("Method not implemented.");
    }

    exitTrade(): boolean {
        throw new Error("Method not implemented.");
    }

    getCurrentPosition(): OpenTrade {
        throw new Error("Method not implemented.");
    }
}