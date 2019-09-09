import { ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { HeikinAshi } from "Model/Series/Expressions";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";

export class StochasticStrategy extends Strategy {
    public readonly StrategyConfig: StrategyConfig;

    private heikenashi: MarketData;

    constructor(broker: IBroker, messageLogger: MessageLogger) {
        super(broker, messageLogger);
        this.StrategyConfig = {
            resolutionSet: [
                '1d',
                '30m',
                '1m'
            ],
            initCandleCount: 150
        };
    }

    public tick(currentTick: any) {
        // throw new Error("Method not implemented.");
    }

    public init(input: ResolutionMapped<MarketData>): RawPlot[] {

        this.heikenashi = HeikinAshi(input['30m'].Candles);

        return [
            {
                MarketData: input['1m'],
                Indicators: []
            },
            {
                MarketData: input['30m'],
                Indicators: []
            },
            {
                MarketData: input['1d'],
                Indicators: []
            }
        ]
    }


}