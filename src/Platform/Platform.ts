import { ChartData, Dictionary, IndicatorConfig, PlatformConfiguration, PlotConfig, ReporterData, ResolutionMapped } from "Model/Contracts";
import { Exchange, ExchangeStore } from "Model/Exchange/Exchange";
import { ExchangeSink, ExchangeUpdate } from "Model/Exchange/ExchangeSink";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { Indicator, Strategy, StrategyConfig, StrategyStore } from "Model/Strategy/Strategy";
import { Subscribable } from "Model/Utils/Events";
import { Network } from "Platform/Network";
import * as uuid from "uuid/v4";
import { ReporterInterface } from "Platform/ReporterInterface";

type Plot = {
    MarketData: MarketData;
    Indicators: Indicator[];
};

export class Platform extends Subscribable<Partial<ReporterData>> {
    public get CurrentExchange(): string { return this.config.Exchange; }
    public get CurrentStrategy(): string { return this.config.Strategy; }
    public get IsBacktest(): boolean { return !!this.config.BacktestSettings; }
    public get PlotConfig(): Dictionary<PlotConfig> | undefined { return this.plotConfigMap; }

    public get StrategyConfig(): StrategyConfig | undefined {
        if (this.strategy) {
            return this.strategy.strategyConfig;
        }

        return undefined;
    }

    protected readonly network: INetwork;
    protected readonly reportingInterface: ReporterInterface;

    private strategy: Strategy;
    private exchange: Exchange;
    private marketSink: ExchangeSink;
    private _isRunning: boolean = false;
    private plotMap: Dictionary<Plot>;
    private plotConfigMap: Dictionary<PlotConfig>;

    public constructor(private config: PlatformConfiguration) {
        super();
        this.reportingInterface = new ReporterInterface();
        this.network = new Network();
        this.strategy = this.createStrategy(this.config.Strategy);
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public start(): Dictionary<PlotConfig> {

        const strategyConfig = this.strategy.strategyConfig;

        this.exchange = this.createExchange(this.config.Exchange);

        this.marketSink = new ExchangeSink(this.exchange, strategyConfig.resolutionSet);
        this.exchange.connect(strategyConfig.symbol, this.config.ExchangeAuth).then(() => {
            this._isRunning = true;

            this.initStrategy(this.exchange.broker, strategyConfig, this.marketSink.MarketDataMap);

            this.marketSink.subscribe(this.dataUpdate, this);
            this.marketSink.startStream(strategyConfig.initCandleCount);
        }, (reason) => {
            console.error("Platform: Connection rejected, " + (reason instanceof String ? reason : JSON.stringify(reason)));
        });

        return this.plotConfigMap;
    }

    public getData(lookback: number): Partial<ReporterData> {
        if (this.isRunning) {
            const update = this.StrategyConfig!.resolutionSet.reduce<Dictionary<number>>((acc, res) => {
                acc[res] = lookback;
                return acc;
            }, {});

            const [chartData, startTick] = this.getChartData(update);

            const reporterLogs = this.reportingInterface.getLogsSince(startTick);

            return {
                ChartData: chartData,
                Account: this.exchange.account.getAccountObject(),
                GlyphLogs: reporterLogs.GlyphLogs,
                MessageLogs: reporterLogs.MessageLogs
            };
        } else {
            return {};
        }
    }

    private initStrategy(broker: IBroker, config: StrategyConfig, dataSeries: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {};

        config.resolutionSet.forEach((res) => {
            stratData[res] = dataSeries[res];
        });

        const rawPlots = this.strategy.init(stratData, broker);

        this.plotMap = {};
        this.plotConfigMap = {};

        // set plot and plotconfig
        rawPlots.forEach((rawPlot) => {
            const id = uuid();

            if (!rawPlot.MarketData) {
                return;
            }

            const resolution = rawPlot.MarketData.Candles.Resolution;

            this.plotMap[id] = {
                MarketData: rawPlot.MarketData,
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
            };
        });
    }

    private getChartData(length: ResolutionMapped<number>): [Dictionary<ChartData>, number] {
        let startTick = 0;
        const chartData = Object.keys(this.plotMap).reduce<Dictionary<ChartData>>((map, id) => {
            const res = this.plotMap[id].MarketData.Candles.Resolution;
            const indicators = this.plotMap[id].Indicators;
            const updateLength = length[res];

            if (updateLength) {
                const data = this.plotMap[id].MarketData.Candles.getData(length[res]);

                if (!startTick || data[0].StartTick < startTick) {
                    startTick = data[0].StartTick;
                }

                map[id] = {
                    Data: data,
                    IndicatorData: indicators.map<number[]>((i) => (
                        i.Series.getData(updateLength)
                    ))
                };
            }

            return map;
        }, {});

        return [chartData, startTick];
    }

    private dataUpdate(update: ExchangeUpdate) {
        const reporterData: Partial<ReporterData> = {};

        if (update.AccountUpdate) {
            const flushedUpdate = this.exchange.account.flushUpdate()!;

            try {
                this.strategy.trade(flushedUpdate);
            } catch (ex) {
                // todo send error updates to logger
                console.error("Strategy error: " + ex);
            }

            reporterData.Account = flushedUpdate;
        }

        if (update.CandleUpdate) {
            this.strategy.update(update.CandleUpdate);
        }

        if (this.subscriberCount) {

            if (update.CandleUpdate) {
                const [chartData, _] = this.getChartData(update.CandleUpdate);
                reporterData.ChartData = chartData;
            }

            const messageLogs = this.reportingInterface.flushMessages();
            const glyphLogs = this.reportingInterface.flushGlyphs();

            if (messageLogs && messageLogs.length) {
                reporterData.MessageLogs = messageLogs;
            }

            if (glyphLogs && glyphLogs.length) {
                reporterData.GlyphLogs = glyphLogs;
            }

            this.notifyAll(reporterData);
        }
    }

    private createStrategy(strategy: string): Strategy {
        const ctor = (StrategyStore.get(strategy));

        if (!ctor) {
            throw `Strategy "${strategy}" doesn't exist`;
        }

        return new (ctor)(this.reportingInterface);
    }

    private createExchange(exchange: string) {
        const ctor = (ExchangeStore.get(exchange));

        if (!ctor) {
            throw `Exchange "${exchange}" doesn't exist`;
        }

        return new (ctor)(this.network, this.config.ExchangeAuth);
    }
}
