import { INetwork } from "Model/Platform/Network";
import { MessageLogger } from "./MessageLogger";
import { Reporter } from "Model/Platform/Reporter";
import { BotConfiguration } from "Model/BotConfiguration";
import { Strategy, StrategyCtor } from "Model/Strategy/Strategy";
import { BacktestBroker } from "Exchange/BacktestBroker";
import { Exchange } from "Model/Exchange/Exchange";
import { DataController } from "Model/Exchange/DataController";

export abstract class PlatformBase {
    protected abstract readonly Network: INetwork;
    protected abstract readonly Reporter: Reporter;

    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;
    private dataController: DataController;

    public constructor() {
        this.MessageLogger = new MessageLogger();
    }

    public init(): void {
        this._init(Strategy.GetRegisteredStrategies(), Exchange.GetRegisteredExchanges());
    }

    protected abstract _init(availableStrategies: string[], availableExchanges: string[]): void;

    protected startBot(config: BotConfiguration): void {
        const exchangeCtor = Exchange.GetExchangeCtor(config.Exchange);
        const exchange = new exchangeCtor(this.Network, config.BacktestSettings ? new BacktestBroker() : null);
        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(exchange.Broker, this.MessageLogger);

        const stratConfig = this.currentStrategy.getConfig();

        this.dataController = new DataController(exchange, stratConfig.resolutionSet);



        this.dataController.getBaseData().then((data) => console.log(data));

    }
}
