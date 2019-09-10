import { ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, HeikinAshi, sma } from "Model/Series/Expressions";
import { ISeries } from "Model/Series/Series";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";

export class StochasticStrategy extends Strategy {
    public readonly StrategyConfig: StrategyConfig;

    private heikenashi: MarketData;
    private ema: ISeries;

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
        const m30 = input['30m'];
        this.heikenashi = HeikinAshi(input['30m'].Candles);
        this.ema = ema(m30.Open, 6);
        sma(m30.Open, 3);

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