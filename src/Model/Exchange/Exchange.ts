import { Candle, ExchangeAuth, Order, Position, Resolution, Wallet, Dictionary, Update } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue, UpdateQueue } from "Model/Utils/Queue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal } from "Model/Utils/Events";
import { IBroker } from "./IBroker";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
};

export interface AccountPosition<TFields> {
    Open: Dictionary<Position<TFields>>;
    Closed: Dictionary<Position<TFields>>;
}

export interface AccountOrders<TFields> {
    Open: Dictionary<Order<TFields>>;
    Closed: Dictionary<Order<TFields>>;
}

export interface Account<TOrderFields = {}, TPositionFields = {}> {
    Leverage: Dictionary<number>;
    Wallet: Dictionary<Wallet>;
    Positions: AccountPosition<TPositionFields>;
    OrderBook: AccountOrders<TOrderFields>;
}

export class AccountUpdatex {
    private update: DeepPartial<Account> = {};

    public push(update: Partial<Account>) {
        this.mix(update, this.update, "Leverage");
        this.mix(update, this.update, "Wallet");

        if (update.OrderBook) {
            if (!this.update.OrderBook) {
                this.update.OrderBook = {};
            }

            this.mix(update.OrderBook, this.update.OrderBook, "Open");
            this.mix(update.OrderBook, this.update.OrderBook, "Closed");
        }

        if(update.Positions) {
            if(!this.update.Positions) {
                this.update.Positions = {};
            }

            this.mix(update.Positions, this.update.Positions, "Open");
            this.mix(update.Positions, this.update.Positions, "Closed");
        }
    }

    private mix<T>(source: T, target: T, key: keyof T) {
        if(!source[key]) {
            return;
        }

        if(!target[key]) {
            (target[key] as any) = {};
        }

        Object.assign(source[key] as any, target[key]);
    }
}

export abstract class Exchange {
    public abstract readonly isLive: boolean;
    public abstract readonly broker: IBroker;
    public abstract readonly authSuccess: boolean;

    public readonly leverage: Dictionary<number> = {};
    public readonly wallet: Dictionary<Wallet> = {};

    public abstract readonly account: Account;

    public distessSignal: Signal = new Signal();

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract subscribeCandle(resolutionSet: Resolution[]): CandleQueue;
    public abstract connect(auth?: ExchangeAuth): Promise<IBroker | undefined>;

    protected abstract AccountUpdate: Partial<Account>;

    constructor(protected network: INetwork) {

    }
}