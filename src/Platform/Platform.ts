import { INetwork } from "Model/Platform/Network";
import { MessageLogger } from "./MessageLogger";
import { IReporter, ReporterData } from "Model/Platform/Reporter";
import { BotConfiguration } from "Model/BotConfiguration";
import { Strategy, StrategyConfig } from "Model/Strategy/Strategy";
import { BacktestBroker } from "Exchange/BacktestBroker";
import { Exchange } from "Model/Exchange/Exchange";
import { DataController } from "Model/Exchange/DataController";
import { MarketDataMap, ChartIndicator } from "Model/Platform/Contracts";
import { Plot } from "Model/Data/Trading";
import { Network } from "./Network";

export class Platform {
    protected readonly Network: INetwork;
    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;
    private dataController: DataController;

    public constructor() {
        this.MessageLogger = new MessageLogger();
        this.Network = new Network();
    }

    // public init(): void {
    //     this._init(Strategy.GetRegisteredStrategies(), Exchange.GetRegisteredExchanges());
    // }

    // protected _init(availableStrategies: string[], availableExchanges: string[]): void {

    // }

    public setConfig(config: BotConfiguration): void {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);
        let rawData: MarketDataMap;

        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);
        this.dataController.getBaseData().then((data) => {
            rawData = data;

            this.fixStrategy(stratConfig, rawData);
        });
    }
    
    private fixStrategy(config: StrategyConfig, rawData: MarketDataMap) {

        const stratData: MarketDataMap = {}

        config.resolutionSet.forEach((res) => {
            stratData[res] = rawData[res]; 
        })

        const plot = this.currentStrategy.init(stratData);

        // this.Reporter.init(this.getReporterData(plot, rawData));
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
