import { BacktestBroker } from "Exchange/BacktestBroker";
import { BotConfiguration, ChartIndicator, ReporterData } from "Model/Contracts";
import { MarketDataMap } from "Model/Data/Data";
import { Plot } from "Model/Data/Trading";
import { DataController } from "Model/Exchange/DataController";
import { Exchange } from "Model/Exchange/Exchange";
import { INetwork } from "Model/Network";
import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { MessageLogger } from "./MessageLogger";
import { Network } from "./Network";
import { Subscribable } from "Model/Events";

export class Platform extends Subscribable<ReporterData> {
    protected readonly Network: INetwork;
    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;
    private dataController: DataController;
    private _isRunning: boolean = false;
    private plot: Plot[];

    public constructor(config: BotConfiguration) {
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

    public start() {
        this._isRunning = true;
        this.dataController.getBaseData().then((data) => {
            this.fixStrategy(this.currentStrategy.getConfig(), data);
        });
    }

    private setConfig(config: BotConfiguration) {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);

        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);
    }

    private fixStrategy(config: StrategyConfig, rawData: MarketDataMap) {
        const stratData: MarketDataMap = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = rawData[res];
        })

        this.plot = this.currentStrategy.init(stratData);
        
        const reporterData = this.getReporterData(this.plot, rawData);
        this.notifyAll(reporterData);
    }

    private getReporterData(plot: Plot[], rawData: MarketDataMap): ReporterData {
        const reporterData: ReporterData = {
            Charts: [],
            TradeData: []
        }

        plot.forEach(p => {
            const chartData = {
                Data: rawData[p.Resolution].Candles.getData(),
                Name: "",
                Resolution: p.Resolution,
                Indicators: []
            };

            p.Indicators.forEach((i) => {
                chartData.Indicators.push({
                    PlotType: p[0],
                    Data: p[1].getData()
                } as ChartIndicator)
            })
            reporterData.Charts.push(chartData);
        });

        return reporterData;
    }
}
