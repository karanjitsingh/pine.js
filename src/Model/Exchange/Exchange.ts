import { Candle, ExchangeAuth, Order, Position, Resolution, Wallet } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal, SubscribableValue } from "Model/Utils/Events";
import { SubscribableDictionary } from "Model/Utils/SubscribableDictionary";
import { IBroker } from "./IBroker";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export class IAccount {

}

export class Account {
    // public readonly 
}

export abstract class Exchange {
    public abstract readonly isLive: boolean;
    public abstract readonly broker: IBroker;
    public abstract readonly authSuccess: boolean;
    
    public abstract readonly leverage: SubscribableDictionary<number>;
    public abstract readonly orders: SubscribableDictionary<Order>;
    public abstract readonly conditionalOrders: SubscribableDictionary<Order>;
    public abstract readonly walletBalance: SubscribableDictionary<Wallet>;
    public abstract readonly positions: SubscribableValue<Position>;

    public distessSignal: Signal = new Signal();

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract getCandleQueue(resolutionSet: Resolution[]): Promise<CandleQueue>;
    public abstract connect(auth?: ExchangeAuth): Promise<IBroker | undefined>;

    constructor(protected network: INetwork) { }
}