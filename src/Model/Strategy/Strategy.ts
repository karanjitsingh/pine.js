import { Resolution, ResolutionMapped, Dictionary } from "Model/Contracts";
import { MarketData } from "Model/Data/Data";
import { IBroker } from "Model/Exchange/IBroker";
import { MessageLogger } from "Platform/MessageLogger";
import { RawPlot } from "./Contracts";
import { Trader } from "./Trader";

export type StrategyCtor = new (broker: IBroker, messageLogger: MessageLogger) => Strategy;

export interface StrategyConfig {
    resolutionSet: Resolution[];
}

export abstract class Strategy {
    protected readonly Trader: Trader;
    protected readonly MessageLogger: MessageLogger;
    
    protected readonly abstract StrategyConfig: StrategyConfig;

    private static registeredStrategies: Dictionary<StrategyCtor> = {}

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

    public abstract init(input: ResolutionMapped<MarketData>): RawPlot[];
    
    public abstract tick(offset: ResolutionMapped<number>): void;

    public getConfig() {
        return this.StrategyConfig;
    }

    public constructor(broker: IBroker, messageLogger: MessageLogger) {
        this.MessageLogger = messageLogger;
        this.Trader = new Trader(broker);
    }
}