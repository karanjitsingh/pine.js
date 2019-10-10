import { Dictionary, Position, Order, Wallet, DeepPartial } from "Model/Contracts";

export interface AccountPosition<TFields> {
    Open: Dictionary<Position<TFields>>;
    Closed: Dictionary<Position<TFields>>;
}

export interface AccountOrders<TFields> {
    Open: Dictionary<Order<TFields>>;
    Closed: Dictionary<Order<TFields>>;
}

export interface IAccount<TOrderFields = {}, TPositionFields = {}> {
    Leverage: number;
    Wallet: Wallet;
    Positions: AccountPosition<TPositionFields>;
    OrderBook: AccountOrders<TOrderFields>;
}

export class Account<TOrderFields = {}, TPositionFields = {}> implements IAccount<TOrderFields, TPositionFields> {
    public Leverage: number = 0;
    public Wallet: Wallet = {
        Balance: 0,
        OrderMargin: 0,
        PositionMargin: 0
    };
    public Positions: AccountPosition<TPositionFields> = {
        Open: {},
        Closed: {}
    }
    public OrderBook: AccountOrders<TOrderFields> = {
        Open: {},
        Closed: {}
    }

    private accountUpdate: DeepPartial<IAccount> = {};

    public flushUpdate(): DeepPartial<IAccount> {
        const temp = this.accountUpdate;
        this.accountUpdate = {};

        return temp;
    }

    public update(update: DeepPartial<IAccount>) {
        Object.assign(this.Leverage, update.Leverage);
        Object.assign(this.Wallet, update.Wallet);

        this.mix(update, this.accountUpdate, "Leverage");
        this.mix(update, this.accountUpdate, "Wallet");

        ["OrderBook", "Positions"].forEach((key: "OrderBook" | "Positions") => {
            if (update[key]) {
                if (!this.accountUpdate[key]) {
                    this.accountUpdate[key] = {};
                }
                
                Object.assign(this[key].Open, update[key].Open)
                Object.assign(this[key].Closed, update[key].Closed)
                
                this.mix(update[key], this.accountUpdate[key], "Open");
                this.mix(update[key], this.accountUpdate[key], "Closed");

                if(update[key].Closed) {
                    Object.keys(update[key].Closed).forEach((id) => {
                        if(this.accountUpdate[key].Open && this.accountUpdate[key].Open[id]) {
                            delete this.accountUpdate[key].Open[id];
                        }

                        if(this[key].Open && this[key].Open[id]) {
                            delete this[key].Open[id];
                        }
                    });
                }
            }
        });
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
