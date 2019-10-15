import { AccountOrders, AccountPosition, IAccount, Wallet } from "Model/Contracts";


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

    private accountUpdate: Partial<IAccount> = {};

    public flushUpdate(): Partial<IAccount> {
        const temp = this.accountUpdate;
        this.accountUpdate = {};

        return temp;
    }

    public update(update: Partial<IAccount>) {
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

                if (update[key].Closed) {
                    Object.keys(update[key].Closed).forEach((id) => {
                        if (this.accountUpdate[key].Open && this.accountUpdate[key].Open[id]) {
                            delete this.accountUpdate[key].Open[id];
                        }

                        if (this[key].Open && this[key].Open[id]) {
                            delete this[key].Open[id];
                        }
                    });
                }
            }
        });
    }

    private mix<T>(source: T, target: T, key: keyof T) {
        if (!source[key]) {
            return;
        }

        if (!target[key]) {
            (target[key] as any) = {};
        }

        Object.assign(source[key] as any, target[key]);
    }
}
