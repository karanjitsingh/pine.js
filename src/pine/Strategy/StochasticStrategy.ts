import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { Plot } from "Model/Data/Trading";
import { Trader } from "Model/Strategy/Trader";

export class StochasticStrategy extends Strategy {
    protected StrategyConfig: StrategyConfig;

    protected readonly Trader: Trader;

    public tick(currentTick: any) {
        throw new Error("Method not implemented.");
    }

    public init(): Plot[] {
        return [];
    }   
}