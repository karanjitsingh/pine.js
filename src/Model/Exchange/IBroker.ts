import { OpenTrade } from "Model/Contracts";

export interface IBroker {
    readonly BrokerBusy: boolean;
    enterLong(leverage: number, qty: number): boolean;
    enterShort(leverage: number, qty: number): boolean;
    exitTrade(): boolean;
    getCurrentPosition(): OpenTrade | null;
}