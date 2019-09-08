import { BacktestBroker } from "Exchange/BacktestBroker";
import { Candle, ChartData, IndicatorConfig, PlatformConfiguration, ReporterData, Resolution, ResolutionMapped, Trade, Dictionary, PlotConfig } from "Model/Contracts";
import { MarketData } from "Model/Data/Data";
import { Subscribable } from "Model/Events";
import { DataController } from "Model/Exchange/DataController";
import { Exchange } from "Model/Exchange/Exchange";
import { INetwork } from "Model/Network";
import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "Platform/MessageLogger";
import { Network } from "Platform/Network";
import * as uuid from 'uuid/v4';
import { Plot } from "Model/Strategy/Contracts";

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
        return this.currentStrategy.getConfig();
    }

    public start(): Dictionary<PlotConfig> {
        this._isRunning = true;
        this.initStrategy(this.currentStrategy.getConfig(), this.dataController.MarketDataMap);

        this.dataController.subscribe(this.updateCallback, this);
        this.dataController.startStream();

        return this.plotConfigMap;
    }

    private setConfig(config: PlatformConfiguration) {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);

        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

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
                    PlotType: indicator.PlotType
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

            if(updateLength) {
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
        if(this.subscriberCount) {
            this.notifyAll(this.getReporterData(this.plotMap, this.dataController.MarketDataMap, update));
        }
    }
}
