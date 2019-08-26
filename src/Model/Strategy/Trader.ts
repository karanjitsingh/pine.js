import { IBroker } from "Model/Exchange/IBroker";
import { OpenTrade } from "Model/Data/Trading";
import { Series } from "Model/Data/Series";
import { Trade } from "Model/Contracts";

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
