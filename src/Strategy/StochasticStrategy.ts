import { ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, HeikinAshi, sma, Stoch, Expression } from "Model/Series/Expressions";
import { ISeries } from "Model/Series/Series";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";
import { Order } from "Model/Exchange/Orders";

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

    public update(updateOffset: ResolutionMapped<number>) {
        console.log("strategy tick", updateOffset);
    }

    public trade(update: Order) {
         
    }

    public init(input: ResolutionMapped<MarketData>): RawPlot[] {
        const m30 = input['30m'];
        this.heikenashi = HeikinAshi(input['30m'].Candles);
        this.ema = ema(m30.Open, 6);
        sma(this.heikenashi.Open, 3);

        const k = ema(ema(Stoch(this.heikenashi.Close, this.heikenashi.High, this.heikenashi.Low, 20), 3), 3);
        const k2 = Expression((self, k) => {
            return k(0) - 40;
        }, k);

        const d = sma(k2, 3);

        const diff = Expression((self, k, d) => {
            return k(0) - d(0);
        }, k2, d)

        return [
            {
                MarketData: input['30m'],
                Indicators: [
                    {
                        PlotType: 'Area',
                        Series: diff,
                        Color: 'rgba(239,83,80,0.65)'
                    },
                    {
                        PlotType: 'Area',
                        Series: d,
                        Color: 'rgba(255,152,0,0.65)'
                    },
                    {
                        PlotType: 'Area',
                        Series: k2,
                        Color: 'rgba(255,255,255,0.6)'
                    },
                ]
            }
        ]
    }
}