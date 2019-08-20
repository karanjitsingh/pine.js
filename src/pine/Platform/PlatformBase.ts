import { INetwork } from "Model/Platform/Network";
import { MessageLogger } from "./MessageLogger";
import { Reporter } from "Model/Platform/Reporter";
import { BotConfiguration } from "Model/BotConfiguration";
import { Strategy, StrategyCtor } from "Model/Strategy/Strategy";
import { BacktestBroker } from "Exchange/BacktestBroker";
import { Exchange } from "Model/Exchange/Exchange";
import { DataController } from "Exchange/DataController";

export abstract class PlatformBase {
    protected abstract readonly Network: INetwork;
    protected abstract readonly Reporter: Reporter;

    protected readonly MessageLogger: MessageLogger;

    private currentStrategy: Strategy;

    public constructor() {
        this.MessageLogger = new MessageLogger();
    }

    public init() {
        this._init(Strategy.GetRegisteredStrategies(), Exchange.GetRegisteredExchanges());
    }

    protected abstract _init(availableStrategies: string[], availableExchanges: string[]);

    protected startBot(config: BotConfiguration) {
        const exchange = new (Exchange.GetExchangeCtor(config.Exchange))(this.Network, config.BacktestSettings ? new BacktestBroker() : null);
        this.currentStrategy = new (Strategy.GetStartegyCtor(config.Strategy))(new DataController(exchange), exchange.Broker, this.MessageLogger);
    }
}
