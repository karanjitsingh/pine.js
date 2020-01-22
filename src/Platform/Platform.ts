import { ChartData, Dictionary, IndicatorConfig, PlatformConfiguration, PlotConfig, ReporterData, ResolutionMapped } from "Model/Contracts";
import { Exchange, ExchangeStore } from "Model/Exchange/Exchange";
import { ExchangeSink, ExchangeUpdate } from "Model/Exchange/ExchangeSink";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { Indicator, Strategy, StrategyConfig, StrategyStore } from "Model/Strategy/Strategy";
import { Subscribable } from "Model/Utils/Events";
import { Network } from "Platform/Network";
import * as uuid from 'uuid/v4';
import { ReportingInterface } from "Platform/ReportingInterface";

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
            return this.strategy.StrategyConfig;
        }

        return undefined;
    }

    protected readonly network: INetwork;
    protected readonly logger: ReportingInterface;

    private strategy: Strategy;
    private exchange: Exchange;
    private marketSink: ExchangeSink;
    private _isRunning: boolean = false;
    private plotMap: Dictionary<Plot>;
    private plotConfigMap: Dictionary<PlotConfig>;

    public constructor(private config: PlatformConfiguration) {
        super();
        this.logger = new ReportingInterface();
        this.network = new Network();
        this.strategy = this.createStrategy(this.config.Strategy);
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public start(): Dictionary<PlotConfig> {

        const strategyConfig = this.strategy.StrategyConfig;

        this.exchange = this.createExchange(this.config.Exchange);

        this.marketSink = new ExchangeSink(this.exchange, strategyConfig.resolutionSet);
        this.exchange.connect(strategyConfig.symbol, this.config.ExchangeAuth).then(() => {
            this._isRunning = true;

            this.initStrategy(this.exchange.broker, strategyConfig, this.marketSink.MarketDataMap);

            this.marketSink.subscribe(this.dataUpdate, this);
            this.marketSink.startStream(strategyConfig.initCandleCount);
        }, (reason) => {
            console.log("Platform: Connection rejected, " + (reason instanceof String ? reason : JSON.stringify(reason)));
        });

        return this.plotConfigMap;
    }

    public getData(lookback: number): Partial<ReporterData> {
        if (this.isRunning) {
            const update = this.StrategyConfig.resolutionSet.reduce<Dictionary<number>>((acc, res) => {
                acc[res] = lookback;
                return acc;
            }, {});
            return {
                ChartData: this.getChartData(this.plotMap, this.marketSink.MarketDataMap, update),
                Account: this.exchange.account.getAccountObject()
            }
        } else {
            return {};
        }
    }

    private initStrategy(broker: IBroker, config: StrategyConfig, dataSeries: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = dataSeries[res];
        })

        const rawPlots = this.strategy.init(stratData, broker);

        this.plotMap = {};
        this.plotConfigMap = {};

        // set plot and plotconfig
        rawPlots.forEach((rawPlot) => {
            const id = uuid();
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
            }
        })
    }

    private getChartData(plot: Dictionary<Plot>, rawData: ResolutionMapped<MarketData>, length: ResolutionMapped<number>): Dictionary<ChartData> {
        return Object.keys(plot).reduce<Dictionary<ChartData>>((map, id) => {
            const res = plot[id].MarketData.Candles.Resolution;
            const indicators = plot[id].Indicators;
            const updateLength = length[res];

            if (updateLength) {
                map[id] = {
                    Data: plot[id].MarketData.Candles.getData(length[res]),
                    IndicatorData: indicators.map<number[]>((i) => (
                        i.Series.getData(updateLength)
                    )),
                };
            }

            return map;
        }, {});
    }

    private dataUpdate(update: ExchangeUpdate) {
        let reporterData: Partial<ReporterData> = {};

        if (update.AccountUpdate) {
            const flushedUpdate = this.exchange.account.flushUpdate();

            try {
                this.strategy.trade(flushedUpdate);
            } catch (ex) {
                // todo send error updates to logger
                console.error("Strategy error: " + ex);
            }

            reporterData.Account = flushedUpdate;
        }

        if (update.CandleUpdate) {

            try {

            } catch (ex) {
                // todo send error updates to logger
                console.error("Strategy error: " + ex);
            }

            this.strategy.update(update.CandleUpdate);
            reporterData.ChartData = this.getChartData(this.plotMap, this.marketSink.MarketDataMap, update.CandleUpdate);
        }

        var logMessages = this.logger.flush();

        if (logMessages.length > 0) {
            reporterData.Logs = logMessages;
        }

        if (this.subscriberCount) {
            this.notifyAll(reporterData);
        }
    }

    private createStrategy(strategy: string): Strategy {
        var ctor = (StrategyStore.get(strategy));

        if (!ctor) {
            throw `Strategy "${strategy}" doesn't exist`;
        }

        return new (ctor)(this.logger);
    }

    private createExchange(exchange: string) {
        var ctor = (ExchangeStore.get(exchange));

        if (!ctor) {
            throw `Exchange "${exchange}" doesn't exist`;
        }

        return new (ctor)(this.network, this.config.ExchangeAuth);
    }
}
