import { MarketData, ResolutionMapped } from "Model/Data/Data";
import { IBroker } from "Model/Exchange/IBroker";
import { PlotMap, RawPlot } from "Model/Strategy/Contracts";
import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { Trader } from "Model/Strategy/Trader";
import { MessageLogger } from "Platform/MessageLogger";

export class StochasticStrategy extends Strategy {
    protected StrategyConfig: StrategyConfig;

    protected readonly Trader: Trader;

    constructor(broker: IBroker, messageLogger: MessageLogger) {
        super(broker, messageLogger);
        this.StrategyConfig = {
            resolutionSet: [
                '1d',
                '30m'
            ]
        };
    }

    public tick(currentTick: any) {
        // throw new Error("Method not implemented.");
    }

    public init(input: ResolutionMapped<MarketData>): RawPlot[] {


        return [
            {
                MarketData: input['30m'],
                Indicators: []
            },
            {
                MarketData: input['1d'],
                Indicators: []
            }
        ]
        // return this.StrategyConfig.resolutionSet.reduce<PlotMap>((map ,res) => {
        //     map[res] = {
        //         Resolution: 
        //     };
        //     map[res].Indicators  = [];
        //     return map;
        // }, {})
    }


}