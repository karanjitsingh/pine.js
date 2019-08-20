import { Plot } from "Model/Data/Trading";
import { Trader } from "./Trader";
import { MessageLogger } from "Platform/MessageLogger";
import { DataController } from "Exchange/DataController";
import { IBroker } from "Model/Exchange/IBroker";

export type StrategyCtor = new (dataController: DataController, broker: IBroker, messageLogger: MessageLogger) => Strategy;

export abstract class Strategy {
    protected readonly Trader: Trader;
    protected readonly MessageLogger: MessageLogger;

    private static registeredStrategies: {[name: string]: StrategyCtor} = {}

    public static Register(name: string, factory: StrategyCtor) {
        if (Strategy.registeredStrategies[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        Strategy.registeredStrategies[name] = factory;
    }

    public static GetRegisteredStrategies(): string[] {
        return Object.keys(this.registeredStrategies);
    }

    public static GetStartegyCtor(strategy: string): StrategyCtor {
        return this.registeredStrategies[strategy];
    }


    public abstract init(): Plot[];
    public abstract tick(currentTick);

    public constructor(dataController: DataController, broker: IBroker, messageLogger: MessageLogger) {
        dataController.subscribe(this.tick, this);
        this.MessageLogger = messageLogger;
        this.Trader = new Trader(broker);
    }
}