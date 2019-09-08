import { OpenTrade } from "Model/InternalContracts";

export interface IBroker {
    enterLong(leverage: number, qty: number): Promise<OpenTrade>;
    enterShort(leverage: number, qty: number): Promise<OpenTrade>;
    exitTrade(): Promise<void>;
    getCurrentPosition(): Promise<OpenTrade>;
}