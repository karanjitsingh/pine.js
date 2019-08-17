import { Series } from "../Data/Series";
import { IExchange } from "../Exchange/IExchange";

enum Position {
    Long,
    Short
}

interface OpenTrade {
    entry: number,
    leverage: number,
    orderValue: number,
    position: Position
}

class Trader {
    public openTrade: OpenTrade;

    public long(leverage: number, qty: number) {

    }
    
    public short(leverage: number, qty: number) {

    }

    public exit() {

    }
}

interface Trade {
    EntryTick: number;
    ExitTick: number;
    EntryPrice: number;
    ExitPrice: number;
    ProfitLoss: number;
    FeePaid: number;
    NetAccountValue: number;
    FillType: string;
}

export abstract class Strategy {
    protected readonly Trader: Trader;
    protected readonly TradeBook: Series<Trade>;

    public constructor(exchange: IExchange) {
        exchange.DataStream.subscribe(this.tick, this);
    }

    abstract defineIndicators(): Series<number>[];
    abstract tick(currentTick);
}