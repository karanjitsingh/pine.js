import { IAccount, Wallet, Dictionary, Position, Order } from "Model/Contracts";
export class Account<TOrderFields = {}, TPositionFields = {}> implements IAccount<TOrderFields, TPositionFields> {
    public Leverage: number = 0;
    public Wallet: Wallet = {
        Balance: 0
    };

    public Positions: Dictionary<Position<TPositionFields>> = {};
    public Orders: Dictionary<Order<TOrderFields>> = {};

    private accountUpdate: Partial<IAccount> | null = null;
    private _didUpdate: boolean = false;

    public flushUpdate(): Partial<IAccount> | null {
        const temp = this.accountUpdate;

        this.accountUpdate = null;
        this._didUpdate = false;

        return temp;
    }

    public getAccountObject(): IAccount {
        return {
            Leverage: this.Leverage,
            Wallet: this.Wallet,
            Positions: this.Positions,
            Orders: this.Orders
        };
    }

    public didUpdate(): boolean {
        return this._didUpdate;
    }

    public update(update: Partial<IAccount>) {

        if (!this.accountUpdate) {
            this.accountUpdate = {};
        }

        if (update.Leverage) {
            this.Leverage = update.Leverage;
            this.accountUpdate.Leverage = update.Leverage;
        }

        if (update.Wallet) {
            this.accountUpdate.Wallet = {
                Balance: 0
            };

            Object.assign(this.Wallet, update.Wallet);
            Object.assign(this.accountUpdate.Wallet, update.Wallet);
        }

        if (update.Orders) {
            this.accountUpdate.Orders = {};

            Object.assign(this.Orders, update.Orders);
            Object.assign(this.accountUpdate.Orders, update.Orders);
        }

        if (update.Positions) {
            this.accountUpdate.Positions = {};

            Object.assign(this.Positions, update.Positions);
            Object.assign(this.accountUpdate.Positions, update.Positions);
        }

        this._didUpdate = true;
    }
}
