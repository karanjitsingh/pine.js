import { IExchange } from "Model/Exchange/IExchange";
import { Plot } from "Model/Data/Trading";
import { Trader } from "./Trader";
import { MessageLogger } from "Platform/MessageLogger";

export abstract class Strategy {
    private static registeredStrategies: {[name: string]: new (exchange: IExchange) => Strategy}

    protected readonly Trader: Trader;
    protected readonly MessageLogger: MessageLogger;

    public constructor(exchange: IExchange, messageLogger: MessageLogger) {
        exchange.DataStream.subscribe(this.tick, this);
        this.MessageLogger = messageLogger;
        this.Trader = new Trader(exchange.Broker);
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