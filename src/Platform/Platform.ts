import { BacktestBroker } from "Exchange/Backtest/BacktestBroker";
import { Candle, ChartData, Dictionary, IndicatorConfig, PlatformConfiguration, PlotConfig, ReporterData, Resolution, ResolutionMapped, Trade } from "Model/Contracts";
import { DataController } from "Model/Exchange/DataController";
import { ExchangeStore } from "Model/Exchange/Exchange";
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

export class Platform extends Subscribable<ReporterData> {
    protected readonly Network: INetwork;
    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;
    private dataController: DataController;
    private _isRunning: boolean = false;
    private plotMap: Dictionary<Plot>;
    private plotConfigMap: Dictionary<PlotConfig>;

    public constructor(config: PlatformConfiguration) {
        super();
        this.MessageLogger = new MessageLogger();
        this.Network = new Network();

        this.setConfig(config);
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public getStrategyConfig(): StrategyConfig {
        return this.currentStrategy.StrategyConfig;
    }

    public start(): Dictionary<PlotConfig> {
        this._isRunning = true;
        const stratConfig = this.currentStrategy.StrategyConfig;

        this.initStrategy(stratConfig, this.dataController.MarketDataMap);

        this.dataController.subscribe(this.updateCallback, this);
        this.dataController.startStream(stratConfig.initCandleCount);

        return this.plotConfigMap;
    }

    private setConfig(config: PlatformConfiguration) {
        const exchangeCtor = ExchangeStore.get(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);

        this.currentStrategy = new (StrategyStore.get(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.StrategyConfig;

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);
    }

    private initStrategy(config: StrategyConfig, dataSeries: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = dataSeries[res];
        })

        const rawPlots = this.currentStrategy.init(stratData);

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

    private getReporterData(plot: Dictionary<Plot>, rawData: ResolutionMapped<MarketData>, update: ResolutionMapped<number>): ReporterData {
        const reporterData: ReporterData = {
            ChartData: {},
            TradeData: [] as Trade[]
        };

        const rawDataUpdate = Object.keys(update).reduce<ResolutionMapped<Candle[]>>((map, res: Resolution) => {
            map[res] = rawData[res].Candles.getData(update[res]);
            return map;
        }, {});

        reporterData.ChartData = Object.keys(plot).reduce<Dictionary<ChartData>>((map, id) => {
            const res = plot[id].Resolution;
            const indicators = plot[id].Indicators;
            const updateLength = update[res];

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

        return reporterData;
    }

    private updateCallback(update: ResolutionMapped<number>) {
        this.currentStrategy.tick(update);
        if (this.subscriberCount) {
            this.notifyAll(this.getReporterData(this.plotMap, this.dataController.MarketDataMap, update));
        }
    }
}
