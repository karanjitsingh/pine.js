import { Candle, Resolution, Dictionary } from "Model/Contracts";
import { DataQueue } from "Model/Exchange/DataQueue";
import { IBroker } from "Model/Exchange/IBroker";
import { INetwork } from "Model/Network";

export type ExchangeCtor = new (network: INetwork, broker: IBroker) => Exchange;

interface IExchange {
    readonly Broker: IBroker;
    
    getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    isLive(): boolean;
    start(resolutionSet: Resolution[]): Promise<DataQueue>;

}

export abstract class Exchange implements IExchange {
    public readonly Broker: IBroker;

    private static registeredExchanges: Dictionary<ExchangeCtor> = {};

    public static Register(name: string, exchangeCtor: ExchangeCtor) {
        if (Exchange.registeredExchanges[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        Exchange.registeredExchanges[name] = exchangeCtor;
    }

    public static GetExchangeCtor(exchange: string): ExchangeCtor {
        return this.registeredExchanges[exchange];
    }

    public static GetRegisteredExchanges(): string[] {
        return Object.keys(this.registeredExchanges);
    }

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    
    public abstract isLive(): boolean;

    public abstract start(resolutionSet: Resolution[]): Promise<DataQueue>;

    constructor(protected network: INetwork, broker: IBroker) {
        this.Broker = broker;
        this.network = network;
    }
}