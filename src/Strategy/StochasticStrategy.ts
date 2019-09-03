import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { Plot } from "Model/Data/Trading";
import { Trader } from "Model/Strategy/Trader";
import { IBroker } from "Model/Exchange/IBroker";
import { MessageLogger } from "Platform/MessageLogger";
import {  Resolution, ResolutionMapped, MarketData } from "Model/Data/Data";

export class StochasticStrategy extends Strategy {
    protected StrategyConfig: StrategyConfig;

    protected readonly Trader: Trader;

    constructor(broker: IBroker, messageLogger: MessageLogger) {
        super(broker, messageLogger);
        this.StrategyConfig = {
            resolutionSet: [
                Resolution.$1d,
                Resolution.$30m
            ]
        }
    }

    public tick(currentTick: any) {
        // throw new Error("Method not implemented.");
    }

    public init(input: ResolutionMapped<MarketData>): Plot[] {

        return this.StrategyConfig.resolutionSet.map((res) => ({
            Resolution: res,
            Indicators: []
        } as Plot))
    }   
}