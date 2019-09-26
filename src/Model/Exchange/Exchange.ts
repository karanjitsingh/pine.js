import { Account, Candle, ExchangeAuth, Resolution, Update } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal, Subscribable } from "Model/Utils/Events";
import { IBroker } from "./IBroker";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export abstract class Exchange extends Subscribable<Update<Account>> {
    public abstract readonly isLive: boolean;
    public abstract readonly lastPrice: number;
    public abstract readonly broker: IBroker;
    public readonly account: Account;

    public distessSignal: Signal;
    
    public get authSuccess(): boolean { return this._authSuccess; }

    public abstract getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]>;
    public abstract getCandleQueue(resolutionSet: Resolution[]): Promise<CandleQueue>;
    public abstract connect(auth?: ExchangeAuth): Promise<void>;
    
    private _authSuccess: boolean = false;

    protected accountUpdate(update: Partial<Account>) {
        const change: Update<Account> = {};

        Object.assign(this.account, update);

        Object.keys(update).forEach((key: keyof Account) => {
            change[key] = true;
        });

        this.notifyAll(change);
    }

    protected setAuthSuccess(update: Account) {
        this.accountUpdate(update);
        this._authSuccess = true;
    }

    constructor(protected network: INetwork) {
        super();

        this.account = {
            Balance: 0,
            Position: null,
            Leverage: 0
        }
    }
}