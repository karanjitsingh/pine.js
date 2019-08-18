import { Series, RawSeries } from "../Data/Series";
import { IExchange } from "../Exchange/IExchange";
import { Trade, OpenTrade, Plot } from "Model/Data/Trading";

export class Trader {
    public readonly openTrade: OpenTrade;
    public  readonly TradeBook: Series<Trade>;

    public long(leverage: number, qty: number) {

    }
    
    public short(leverage: number, qty: number) {

    }

    public exit() {

    }
}

export abstract class Strategy {
    private static registeredStrategies: {[name: string]: new (exchange: IExchange) => Strategy}

    protected abstract readonly Trader: Trader;

    public constructor(exchange: IExchange) {
        exchange.DataStream.subscribe(this.tick, this);
    }

    public abstract init(): Plot[];
    public abstract tick(currentTick);

    public static register(name: string, factory: new (exchange: IExchange) => Strategy) {
        if (Strategy.registeredStrategies[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        Strategy.registeredStrategies[name] = factory;
    }
}