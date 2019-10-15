import { Candle, ChartData, Dictionary, IndicatorConfig, PlatformConfiguration, PlotConfig, ReporterData, Resolution, ResolutionMapped } from "Model/Contracts";
import { Exchange, ExchangeStore } from "Model/Exchange/Exchange";
import { MarketSink } from "Model/Exchange/MarketSink";
import { MarketData } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { Indicator, Strategy, StrategyConfig, StrategyStore } from "Model/Strategy/Strategy";
import { Subscribable } from "Model/Utils/Events";
import { MessageLogger } from "Platform/MessageLogger";
import { Network } from "Platform/Network";
import * as uuid from 'uuid/v4';

type Plot = {
    Resolution: Resolution;
    Indicators: Indicator[];
};

export class Platform extends Subscribable<Partial<ReporterData>> {
    public get CurrentExchange(): string { return this.config.Exchange; }
    public get CurrentStrategy(): string { return this.config.Strategy; }
    public get IsBacktest(): boolean { return !!this.config.BacktestSettings; }
    public get PlotConfig(): Dictionary<PlotConfig> | undefined { return this.plotConfigMap; }

    public get StrategyConfig(): StrategyConfig | undefined {
        if (this.strategy) {
            return this.strategy.StrategyConfig;
        }

        return undefined;
    }

    protected readonly Network: INetwork;
    protected readonly MessageLogger: MessageLogger;

    private strategy: Strategy;
    private exchange: Exchange;
    private marketSink: MarketSink;
    private _isRunning: boolean = false;
    private plotMap: Dictionary<Plot>;
    private plotConfigMap: Dictionary<PlotConfig>;

    public constructor(private config: PlatformConfiguration) {
        super();
        this.MessageLogger = new MessageLogger();
        this.Network = new Network();
        this.strategy = new (StrategyStore.get(this.config.Strategy))(null, this.MessageLogger);
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public start(): Dictionary<PlotConfig> {
        const exchangeCtor = ExchangeStore.get(this.config.Exchange);
        const strategyConfig = this.strategy.StrategyConfig;

        this.exchange = new exchangeCtor(this.Network, this.config.ExchangeAuth);
        this.marketSink = new MarketSink(this.exchange, strategyConfig.resolutionSet);

        this.exchange.connect(strategyConfig.symbol, this.config.ExchangeAuth).then(() => {
            this._isRunning = true;
            this.marketSink.subscribe(this.dataUpdate, this);
            this.marketSink.startStream(strategyConfig.initCandleCount);
        }, (reason) => {
            console.log("Platform: Connection rejected, " + (reason instanceof String ? reason : JSON.stringify(reason)));
        });

        this.initStrategy(strategyConfig, this.marketSink.MarketDataMap);
        return this.plotConfigMap;
    }

    public getData(lookback: number): Partial<ReporterData> {
        if (this.isRunning) {
            const update = this.StrategyConfig.resolutionSet.reduce<Dictionary<number>>((acc, res) => {
                acc[res] = lookback;
                return acc;
            }, {});
            return {
                ChartData: this.getChartData(this.plotMap, this.marketSink.MarketDataMap, update)
            }
        } else {
            return {};
        }
    }

    private initStrategy(config: StrategyConfig, dataSeries: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = dataSeries[res];
        })

        const rawPlots = this.strategy.init(stratData);

        this.plotMap = {};
        this.plotConfigMap = {};

        // set plot and plotconfig
        rawPlots.forEach((rawPlot) => {
            const id = uuid();
            const resolution = rawPlot.MarketData.Candles.Resolution;

            this.plotMap[id] = {
                Resolution: resolution,
                Indicators: rawPlot.Indicators
            };

            this.plotConfigMap[id] = {
                Title: rawPlot.Title,
                Resolution: resolution,
                IndicatorConfigs: rawPlot.Indicators.map<IndicatorConfig>((indicator) => ({
                    Title: indicator.Title,
                    PlotType: indicator.PlotType,
                    Color: indicator.Color
                }))
            }
        })
    }

    private getChartData(plot: Dictionary<Plot>, rawData: ResolutionMapped<MarketData>, length: ResolutionMapped<number>): Dictionary<ChartData> {
        const rawDataUpdate = Object.keys(length).reduce<ResolutionMapped<Candle[]>>((map, res: Resolution) => {
            map[res] = rawData[res].Candles.getData(length[res]);
            return map;
        }, {});

        return Object.keys(plot).reduce<Dictionary<ChartData>>((map, id) => {
            const res = plot[id].Resolution;
            const indicators = plot[id].Indicators;
            const updateLength = length[res];

            if (updateLength) {
                map[id] = {
                    Data: rawDataUpdate[res],
                    IndicatorData: indicators.map<number[]>((i) => (
                        i.Series.getData(updateLength)
                    ))
                };
            }

            return map;
        }, {});
    }

    private dataUpdate(update: ResolutionMapped<number>) {
        this.strategy.update(update);
        if (this.subscriberCount) {
            this.notifyAll({
                ChartData: this.getChartData(this.plotMap, this.marketSink.MarketDataMap, update)
            });
        }
    }
}
