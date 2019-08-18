import { Strategy, Trader } from "Model/Strategy/Strategy";
import { Plot } from "Model/Data/Trading";

export class StochasticStrategy extends Strategy {

    protected readonly Trader: Trader;

    public tick(currentTick: any) {
        throw new Error("Method not implemented.");
    }

    public init(): Plot[] {
        return [];
    }   
}