import { Candle, Resolution } from "Model/Contracts";
import { CtorStore } from "Model/CtorStore";
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

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export abstract class Exchange implements IExchange {
    public readonly Broker: IBroker;

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    
    public abstract isLive(): boolean;

    public abstract start(resolutionSet: Resolution[]): Promise<DataQueue>;

    constructor(protected network: INetwork, broker: IBroker) {
        this.Broker = broker;
        this.network = network;
    }
}