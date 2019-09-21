import { Candle, Resolution } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";

export type ExchangeCtor = new (network: INetwork, broker: IBroker) => Exchange;

interface IExchange {
    readonly Broker: IBroker;
    readonly isLive: boolean;
    readonly lastPrice: number;
    
    getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    start(resolutionSet: Resolution[]): Promise<CandleQueue>;
}

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export abstract class Exchange implements IExchange {
    public abstract readonly isLive: boolean;
    public abstract readonly lastPrice: number;

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract start(resolutionSet: Resolution[]): Promise<CandleQueue>;

    constructor(protected network: INetwork, public readonly Broker: IBroker) {
        this.network = network;
    }
}