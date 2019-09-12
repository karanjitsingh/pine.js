import { ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, HeikinAshi, sma, Stoch, Expression } from "Model/Series/Expressions";
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
        sma(this.heikenashi.Open, 3);
        
        const k = ema(ema(Stoch(this.heikenashi.Close,this.heikenashi.High, this.heikenashi.Low, 20), 3),3);
        const k2 = Expression((self, k) => {
            return k(0) - 40;
        }, k);

        // const d = sma(k2,3);

        const d = Expression((self, k) => {
            return k(0) + 10;
        }, k2);

        return [
            // {
            //     MarketData: input['1m'],
            //     Indicators: []
            // },
            {
                MarketData: input['30m'],
                Indicators: [{
                    PlotType: 'Area',
                    Series: k2,
                },
                {
                    PlotType: 'Area',
                    Series: d,
                }]
            }
            // ,
            // {
            //     MarketData: input['1d'],
            //     Indicators: []
            // }
        ]
    }


}