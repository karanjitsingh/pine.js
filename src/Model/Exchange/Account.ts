import {IAccount, Wallet, Dictionary, Position, Order } from "Model/Contracts";


export class Account<TOrderFields = {}, TPositionFields = {}> implements IAccount<TOrderFields, TPositionFields> {
    public Leverage: number = 0;
    public Wallet: Wallet = {
        Balance: 0,
        OrderMargin: 0,
        PositionMargin: 0
    };

    public Positions: Dictionary<Position<TPositionFields>> = {};

    public OrderBook: Dictionary<Order<TOrderFields>> = {};

    private accountUpdate: Partial<IAccount> = {};

    public flushUpdate(): Partial<IAccount> {
        const temp = this.accountUpdate;
        this.accountUpdate = {};

        return temp;
    }

    public update(update: Partial<IAccount>) {
        
        if(update.Leverage) {
            this.Leverage = update.Leverage;
            this.accountUpdate.Leverage = update.Leverage;
        }

        Object.assign(this.Wallet, update.Wallet);
        Object.assign(this.accountUpdate.Wallet, update.Wallet);

        Object.assign(this.OrderBook, update.OrderBook)
        Object.assign(this.accountUpdate.OrderBook, update.OrderBook);
        
        Object.assign(this.Positions, update.Positions);
        Object.assign(this.accountUpdate.Positions, update.Positions);
    }
}
