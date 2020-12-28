import { Candle, ExchangeAuth, Order, Position, Resolution, Wallet, Dictionary, DeepPartial } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/Queue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal } from "Model/Utils/Events";
import { IBroker } from "./IBroker";
import { Account } from "./Account";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export abstract class Exchange {
    public abstract readonly isLive: boolean;
    public abstract readonly broker: IBroker;
    public abstract readonly authSuccess: boolean;
    public abstract readonly lastPrice: number;
    public abstract readonly marketPrice: number;
    public abstract readonly symbol: string;

    public readonly account: Account = new Account();

    public distessSignal: Signal = new Signal();

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract subscribeCandle(resolutionSet: Resolution[]): CandleQueue;
    public abstract connect(symbol: string, auth?: ExchangeAuth): Promise<IBroker | undefined>;
    public abstract getSymbolList(): string[];

    constructor(protected network: INetwork) {
        //
    }
}