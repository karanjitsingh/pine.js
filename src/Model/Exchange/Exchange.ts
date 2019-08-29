import { IBroker } from "Model/Exchange/IBroker";
import { DataStream } from "Model/Exchange/DataStream";
import { INetwork } from "Model/Network";
import { Candle } from "Model/Contracts";
import { Resolution } from "Model/Data/Data";

export type ExchangeCtor = new (network: INetwork, broker: IBroker) => Exchange;

export abstract class Exchange {
    public readonly Broker: IBroker;
    public readonly DataStream: DataStream;

    private static registeredExchanges: {[id:string]: ExchangeCtor} = {};

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
    
    constructor(protected network: INetwork, broker: IBroker) {
        this.Broker = broker;
        this.network = network;
        this.DataStream = new DataStream();
    }
}