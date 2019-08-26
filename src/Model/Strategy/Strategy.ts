import { Plot } from "Model/Data/Trading";
import { Trader } from "./Trader";
import { MessageLogger } from "Platform/MessageLogger";
import { IBroker } from "Model/Exchange/IBroker";
import { Resolution } from "Model/Contracts";
import { MarketDataMap } from "Model/Data/Data";

export type StrategyCtor = new (broker: IBroker, messageLogger: MessageLogger) => Strategy;

export interface StrategyConfig {
    resolutionSet: Resolution[];
}

export abstract class Strategy {
    protected readonly Trader: Trader;
    protected readonly MessageLogger: MessageLogger;
    
    protected readonly abstract StrategyConfig: StrategyConfig;

    private static registeredStrategies: {[name: string]: StrategyCtor} = {}

    public static Register(name: string, factory: StrategyCtor) {
        if (Strategy.registeredStrategies[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        Strategy.registeredStrategies[name] = factory;
    }

    public static GetRegisteredStrategies(): string[] {
        return Object.keys(this.registeredStrategies);
    }

    public static GetStartegyCtor(strategy: string): StrategyCtor {
        return this.registeredStrategies[strategy];
    }

    public abstract init(input: MarketDataMap): Plot[];
    
    public abstract tick(currentTick);

    public getConfig() {
        return this.StrategyConfig;
    }

    public constructor(broker: IBroker, messageLogger: MessageLogger) {
        this.MessageLogger = messageLogger;
        this.Trader = new Trader(broker);
    }
}