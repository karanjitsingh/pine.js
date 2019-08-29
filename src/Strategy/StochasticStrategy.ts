import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { Plot } from "Model/Data/Trading";
import { Trader } from "Model/Strategy/Trader";
import { IBroker } from "Model/Exchange/IBroker";
import { MessageLogger } from "Platform/MessageLogger";
import { MarketDataMap, Resolution } from "Model/Data/Data";

export class StochasticStrategy extends Strategy {
    protected StrategyConfig: StrategyConfig;

    protected readonly Trader: Trader;

    constructor(broker: IBroker, messageLogger: MessageLogger) {
        super(broker, messageLogger);
        this.StrategyConfig = {
            resolutionSet: [
                Resolution._12h,
                Resolution._30m
            ]
        }
    }

    public tick(currentTick: any) {
        // throw new Error("Method not implemented.");
    }

    public init(input: MarketDataMap): Plot[] {

        return this.StrategyConfig.resolutionSet.map((res) => ({
            Resolution: res,
            Indicators: []
        } as Plot))
    }   
}