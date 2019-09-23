import { Candle, ChartData, Dictionary, IndicatorConfig, PlatformConfiguration, PlotConfig, ReporterData, Resolution, ResolutionMapped } from "Model/Contracts";
import { DataController } from "Model/Exchange/DataController";
import { Exchange, ExchangeStore } from "Model/Exchange/Exchange";
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

    private strategy: Strategy;
    private exchange: Exchange;
    private dataController: DataController;
    private _isRunning: boolean = false;
    private plotMap: Dictionary<Plot>;
    private plotConfigMap: Dictionary<PlotConfig>;

    public constructor(private config: PlatformConfiguration) {
        super();
        this.MessageLogger = new MessageLogger();
        this.Network = new Network();
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    public getStrategyConfig(): StrategyConfig {
        return this.strategy.StrategyConfig;
    }

    public start(): Dictionary<PlotConfig> {
        const exchangeCtor = ExchangeStore.get(this.config.Exchange);

        this.exchange = new exchangeCtor(this.Network, this.config.ExchangeAuth);
        this.strategy = new (StrategyStore.get(this.config.Strategy))(null ,this.MessageLogger);
        this.dataController = new DataController(this.exchange, this.strategy.StrategyConfig.resolutionSet);

        this.exchange.connect(this.config.ExchangeAuth).then(() => {
            this._isRunning = true;
            this.dataController.subscribe(this.dataUpdate, this);
            this.dataController.startStream(this.strategy.StrategyConfig.initCandleCount);
        }, (reason) => {
            console.log("Platfprm: Connection rejected, " + reason);
        });

        this.initStrategy(this.strategy.StrategyConfig, this.dataController.MarketDataMap);
        return this.plotConfigMap;
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

    private getChartData(plot: Dictionary<Plot>, rawData: ResolutionMapped<MarketData>, update: ResolutionMapped<number>): Dictionary<ChartData> {
        const rawDataUpdate = Object.keys(update).reduce<ResolutionMapped<Candle[]>>((map, res: Resolution) => {
            map[res] = rawData[res].Candles.getData(update[res]);
            return map;
        }, {});

        return Object.keys(plot).reduce<Dictionary<ChartData>>((map, id) => {
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
    }

    private dataUpdate(update: ResolutionMapped<number>) {
        this.strategy.tick(update);
        if (this.subscriberCount) {
            this.notifyAll({
                ChartData: this.getChartData(this.plotMap, this.dataController.MarketDataMap, update)
            });
        }
    }
}
