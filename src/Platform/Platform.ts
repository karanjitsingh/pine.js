import { BacktestBroker } from "Exchange/BacktestBroker";
import { Candle, ChartData, PlatformConfiguration, ReporterData, Trade } from "Model/Contracts";
import { MarketData, ResolutionMapped } from "Model/Data/Data";
import { Subscribable } from "Model/Events";
import { DataController } from "Model/Exchange/DataController";
import { Exchange } from "Model/Exchange/Exchange";
import { INetwork } from "Model/Network";
import { PlotMap } from "Model/Strategy/Contracts";
import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "./MessageLogger";
import { Network } from "./Network";

export class Platform extends Subscribable<ReporterData> {
    protected readonly Network: INetwork;
    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;
    private dataController: DataController;
    private _isRunning: boolean = false;
    private plots: PlotMap;

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

    public start(): PlotMap {
        this._isRunning = true;
        this.fixStrategy(this.currentStrategy.getConfig(), this.dataController.MarketDataMap);

        this.dataController.subscribe(this.updateCallback, this);
        this.dataController.startStream();

        return this.plots;
    }

    private setConfig(config: PlatformConfiguration) {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);

        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);
    }

    private fixStrategy(config: StrategyConfig, dataSeries: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = dataSeries[res];
        })

        this.plots = this.currentStrategy.init(stratData);
    }

    private getReporterData(plot: PlotMap, rawData: ResolutionMapped<MarketData>, update?: ResolutionMapped<number>): ReporterData {
        const reporterData: ReporterData = {
            Plots: {},
            TradeData: [] as Trade[]
        };

        const rawDataUpdate = Object.keys(update).reduce<ResolutionMapped<Candle[]>>((map, res) => {
            map[res] = rawData[res].Candles.getData(update[res]);
            return map;
        }, {});

        Object.keys(plot).reduce<{[id: string]: ChartData}>((map, id) => {
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
            this.notifyAll(this.getReporterData(this.plots, this.dataController.MarketDataMap, update));
        }
    }
}
