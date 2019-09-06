import { Trade } from "Model/Contracts";
import { Series } from "Model/Data/Series";
import { OpenTrade } from "Model/Data/Trading";
import { IBroker } from "Model/Exchange/IBroker";

export class Trader {
    public readonly openTrade: OpenTrade;
    public  readonly TradeBook: Series<Trade>;

    public constructor(private readonly Broker: IBroker) {

    }

    public long(leverage: number, qty: number) {

    }
    
    public short(leverage: number, qty: number) {

    }

    public exit() {

    }
}
