import { IAccount, ResolutionMapped, Side, Position } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, Expression, HeikinAshi, sma, Stoch } from "Model/Series/Expressions";
import { ISeries } from "Model/Series/Series";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";

const symbol = 'BTCUSD';

export abstract class StochasticStrategyBase extends Strategy {
    public readonly StrategyConfig: StrategyConfig;

    protected heikenashi30m: MarketData;
    protected currentPosition: Position;

    protected leading: ISeries;
    protected lagging: ISeries;
    protected diff: ISeries;
    protected shape: ISeries;

    constructor(protected messageLogger: MessageLogger) {
        super(messageLogger);
        this.StrategyConfig = {
            resolutionSet: [
                '1d',
                '30m',
                '1m'
            ],
            initCandleCount: 150,
            symbol
        };
    }

    public init(input: ResolutionMapped<MarketData>): RawPlot[] {
        this.heikenashi30m = HeikinAshi(input['30m'].Candles);
        sma(this.heikenashi30m.Open, 3);

        const k = ema(ema(Stoch(this.heikenashi30m.Close, this.heikenashi30m.High, this.heikenashi30m.Low, 20), 3), 3);
        this.leading = Expression((self, k) => {
            return k(0) - 50;
        }, k);

        this.lagging = sma(this.leading, 3);

        this.diff = Expression((self, k, d) => {
            return k(0) - d(0);
        }, this.leading, this.lagging);

        let position;
        if (position = this.broker.OpenPosition) {
            this.currentPosition = position;
        }

        return [
            {
                MarketData: input['30m'],
                Indicators: [
                    {
                        PlotType: 'Area',
                        Series: this.diff,
                        Color: 'rgba(239,83,80,0.65)'
                    },
                    {
                        PlotType: 'Area',
                        Series: this.lagging,
                        Color: 'rgba(255,152,0,0.65)'
                    },
                    {
                        PlotType: 'Area',
                        Series: this.leading,
                        Color: 'rgba(255,255,255,0.6)'
                    },
                ]
            }
        ]
    }
}