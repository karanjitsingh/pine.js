import { Resolution, ResolutionMapped } from "Model/Contracts";
import { CtorStore } from "Model/CtorStore";
import { MarketData } from "Model/Data/Data";
import { IBroker } from "Model/Exchange/IBroker";
import { MessageLogger } from "Platform/MessageLogger";
import { RawPlot } from "./Contracts";
import { Trader } from "./Trader";

export type StrategyCtor = new (broker: IBroker, messageLogger: MessageLogger) => Strategy;

export interface StrategyConfig {
    resolutionSet: Resolution[];
    initCandleCount: number;
}

export const StrategyStore = new CtorStore<StrategyCtor>();

export abstract class Strategy {

    protected readonly Trader: Trader;
    protected readonly MessageLogger: MessageLogger;
    protected readonly abstract StrategyConfig: StrategyConfig;

    public abstract init(input: ResolutionMapped<MarketData>): RawPlot[];
    
    public abstract tick(offset: ResolutionMapped<number>): void;

    public constructor(broker: IBroker, messageLogger: MessageLogger) {
        this.MessageLogger = messageLogger;
        this.Trader = new Trader(broker);
    }

    public getConfig() {
        return this.StrategyConfig;
    }

}
