import { OpenTrade } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { ByBitExchange } from "./ByBitExchange";

export class ByBitBroker implements IBroker {

    private brokerBusy: boolean;

    private currentPosition: OpenTrade = null;

    constructor(private exchange: ByBitExchange) {

    }

    public get BrokerBusy(): boolean {
        return this.brokerBusy;
    }

    enterLong(leverage: number, qty: number): boolean {
        if (this.brokerBusy) {
            return false;
        }

        return true;
    }

    enterShort(leverage: number, qty: number): boolean {
        if (this.brokerBusy) {
            return false;
        }

        return true;
    }

    exitTrade(): boolean {
        if (this.brokerBusy) {
            return false;
        }

        return true;
    }

    getCurrentPosition(): OpenTrade | null {
        return this.currentPosition;
    }
}