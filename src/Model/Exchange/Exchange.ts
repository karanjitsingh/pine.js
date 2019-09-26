import { Candle, ExchangeAuth, Resolution, Update } from "Model/Contracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { CtorStore } from "Model/Utils/CtorStore";
import { Signal, Subscribable } from "Model/Utils/Events";
import { IBroker } from "./IBroker";
import { Order, Side } from "./Orders";
import { SubscribableDictionary } from "Model/Utils/SubscribableDictionary";

export type ExchangeCtor = new (network: INetwork, auth?: ExchangeAuth) => Exchange;

export const ExchangeStore = new CtorStore<ExchangeCtor>();

export interface Position {
    Side: Side,
    Symbol: string,
    Size: number,
    PositionValue: number,
    EntryPrice: number,
    Leverage: number,
    AutoAddMargin: boolean,
    PositionMargin: number,
    LiquidationPrice: number,
    BankrupcyPrice: number,
    ClosingFee: number,
    FundingFee: number,
    TakeProfit: number,
    StopLoss: number,
    TrailingProfit: number,
    PositionStatus: string,
    UsedMargin: number,
    UnrealizedPnl: number,
    CreatedAt: string,
    LastUpdate: string
}

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