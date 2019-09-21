import { Candle, ExchangeAuth, Resolution } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

interface IExchange {
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

    constructor(protected network: INetwork, protected auth?: ExchangeAuth) { }
}