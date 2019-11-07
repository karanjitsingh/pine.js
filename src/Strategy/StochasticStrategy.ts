import { IAccount, ResolutionMapped, Side, Position } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ema, Expression, HeikinAshi, sma, Stoch } from "Model/Series/Expressions";
import { ISeries } from "Model/Series/Series";
import { RawPlot, Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";

const symbol = 'BTCUSD';

export class StochasticStrategy extends Strategy {
    public readonly StrategyConfig: StrategyConfig;

    private heikenashi30m: MarketData;
    private currentPosition: Position;

    private leading: ISeries;
    private lagging: ISeries;
    private diff: ISeries;
    private shape: ISeries;

    constructor(protected broker: IBroker, protected messageLogger: MessageLogger) {
        super(broker, messageLogger);
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

    public update(updateOffset: ResolutionMapped<number>) {
        /**
         * if lagging wave d goes into k from below, then long
         * if lagging wave d goes into k from above, then short
         * 
         * close position if opposite happens
         * 
         * keep a stop loss 
         * 
         * consolidation mode?
         */

        if(updateOffset['30m']) {

        }


    }

    public trade(update: Partial<IAccount>) {

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