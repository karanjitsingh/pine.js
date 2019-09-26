import { Candle, ExchangeAuth, Order, Position, Resolution } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal } from "Model/Utils/Events";
import { SubscribableDictionary } from "Model/Utils/SubscribableDictionary";
import { IBroker } from "./IBroker";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export abstract class Exchange {
    public abstract readonly isLive: boolean;
    public abstract readonly lastPrice: number;
    public abstract readonly broker: IBroker;
    public abstract readonly authSuccess: boolean;
    
    public readonly orderBook = new SubscribableDictionary<Order>();
    public readonly positions = new SubscribableDictionary<Position>();

    public distessSignal: Signal;

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract getCandleQueue(resolutionSet: Resolution[]): Promise<CandleQueue>;
    public abstract connect(auth?: ExchangeAuth): Promise<IBroker | undefined>;

    constructor(protected network: INetwork) { }
}