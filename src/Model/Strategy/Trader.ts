import { IBroker } from "Model/Exchange/IBroker";
import { OpenTrade, Trade } from "Model/Data/Trading";
import { Series } from "Model/Data/Series";

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
