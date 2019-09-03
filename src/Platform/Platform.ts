import { BacktestBroker } from "Exchange/BacktestBroker";
import { PlatformConfiguration, ChartIndicator, ReporterData } from "Model/Contracts";
import { ResolutionMapped, MarketData } from "Model/Data/Data";
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

    public start() {
        this._isRunning = true;
        this.fixStrategy(this.currentStrategy.getConfig(), this.dataController.MarketDataMap);

        this.dataController.startStream();
        // this.dataController.getBaseData().then((data) => {
        //     this.fixStrategy(this.currentStrategy.getConfig(), data);
        // });
    }

    private setConfig(config: PlatformConfiguration) {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);

        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);
    }

    private fixStrategy(config: StrategyConfig, rawData: ResolutionMapped<MarketData>) {
        const stratData: ResolutionMapped<MarketData> = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = rawData[res];
        })

        this.plot = this.currentStrategy.init(stratData);
        
        const reporterData = this.getReporterData(this.plot, rawData);
    }

    private getReporterData(plot: Plot[], rawData: ResolutionMapped<MarketData>): ReporterData {
        const reporterData: ReporterData = {
            Charts: [],
            TradeData: []
        }

        plot.forEach(p => {
            const chartData = {
                Data: rawData[p.Resolution].Candles.getData(),
                Name: "",
                Resolution: p.Resolution,
                Indicators: [] as ChartIndicator[]
            };

            p.Indicators.forEach((i) => {
                chartData.Indicators.push({
                    PlotType: i[0],
                    Data: i[1].getData()
                } as ChartIndicator)
            })
            reporterData.Charts.push(chartData);
        });

        return reporterData;
    }
}
