import { Position, ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, Expression, HeikinAshi, sma, Stoch } from "Model/Series/Expressions";
import { ISeries } from "Model/Series/Series";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { ReporterInterface } from "Platform/ReporterInterface";

const symbol = "BTCUSD";

export abstract class StochasticStrategyBase extends Strategy {
    public readonly strategyConfig: StrategyConfig;

    protected heikenashi30m: MarketData;
    protected heikenashi4h: MarketData;
    protected currentPosition: Position;

    protected leading: ISeries;
    protected lagging: ISeries;
    protected diff: ISeries;
    protected shape: ISeries;

    constructor(reportingInterface: ReporterInterface) {
        super(reportingInterface);
        this.strategyConfig = {
            resolutionSet: [
                "4h",
                "30m",
                "1m"
            ],
            initCandleCount: 150,
            symbol
        };
    }

    public init(input: ResolutionMapped<MarketData>, broker: IBroker): RawPlot[] {
        this.broker = broker;

        this.heikenashi30m = HeikinAshi(input["30m"]!.Candles);
        this.heikenashi4h = HeikinAshi(input["4h"]!.Candles);

        return [
            this.getStochasticHeikenAshiPlot(this.heikenashi30m),
            this.getStochasticHeikenAshiPlot(this.heikenashi4h)
        ];
    }

    private getStochasticHeikenAshiPlot(data: MarketData): RawPlot {
        sma(data.Open, 3);

        const k = ema(ema(Stoch(data.Close, data.High, data.Low, 20), 3), 3);
        this.leading = Expression((self, k) => {
            return k(0)! - 50;
        }, k);

        this.lagging = sma(this.leading, 3);

        this.diff = Expression((self, k, d) => {
            return k(0)! - d(0)!;
        }, this.leading, this.lagging);

        const position = this.broker.OpenPosition;
        if (position) {
            this.currentPosition = position;
        }

        return {
            MarketData: data,
            Indicators: [
                {
                    PlotType: "Area",
                    Series: this.diff,
                    Color: "rgba(239,83,80,0.65)"
                },
                {
                    PlotType: "Area",
                    Series: this.lagging,
                    Color: "rgba(255,152,0,0.65)"
                },
                {
                    PlotType: "Area",
                    Series: this.leading,
                    Color: "rgba(255,255,255,0.6)"
                }
            ]
        };
    }
}