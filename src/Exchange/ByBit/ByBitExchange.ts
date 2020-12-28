import * as crypto from "crypto";
import { Decimal } from "decimal.js";
import { Candle, Dictionary, ExchangeAuth, IAccount, Resolution, ResolutionMapped } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { Tick } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/Queue";
import { Utils } from "Model/Utils/Utils";
import * as WebSocket from "ws";
import { ByBitApi } from "./ByBitApi";
import { ByBitBroker } from "./ByBitBroker";
import { ByBitContracts, ByBitWebsocketContracts, Symbol } from "./ByBitContracts";

type ConnectionResponse = [
    ByBitContracts["GetActiveOrder"]["Response"],
    ByBitContracts["GetConditionalOrder"]["Response"],
    ByBitContracts["MyPosition"]["Response"],
    ByBitContracts["UserLeverage"]["Response"],
    ByBitContracts["GetWalletFundRecords"]["Response"]
];

export interface ByBitEndpoints {
    websocket: string;
    kline: string;
}

export class ByBitExchange extends Exchange {

    public get isLive(): boolean { return this._isLive; }
    public get broker(): ByBitBroker { return this._broker; }
    public get authSuccess(): boolean { return this._authSuccess; }

    public get lastPrice(): number { return this._lastPrice; }
    public get marketPrice(): number { return this._marketPrice; }
    public get symbol(): Symbol { return this._symbol; }

    public get api(): ByBitApi { return this._api; }

    protected isTestnet: boolean = false;

    protected websocketEndpoint: string = "wss://stream-testnet.bybit.com/realtime";

    private _isLive: boolean = false;
    private _broker: ByBitBroker;
    private _authSuccess: boolean;
    private _lastPrice: number;
    private _marketPrice: number;
    protected _api: ByBitApi;

    private subscribedResolutions: Resolution[];
    private candleQueue: CandleQueue;
    private auth?: ExchangeAuth;
    private connecting: boolean = false;
    private webSocket: WebSocket;
    private _symbol: Symbol;

    private symbolToCurrencyMap: Dictionary<string, Symbol> = {
        "BTCUSD": "BTC",
        "EOSUSD": "EOS",
        "ETHUSD": "ETH",
        "XRPUSD": "XRP"
    };

    private readonly LiveSupportedResolutions: string[] = [
        "1m", "3m", "5m", "15m", "30m",
        "1h", "2h", "3h", "4h", "6h",
        "1d", "3d",
        "1w", "2w",
        "1M"
    ];

    constructor(protected network: INetwork) {
        super(network);
    }

    public getSymbolList() {
        return ["BTCUSD", "ETHUSD", "XRPUSD", "EOSUSD"];
    }

    public async connect(symbol: Symbol, auth?: ExchangeAuth): Promise<ByBitBroker | undefined> {
        this.auth = auth;
        this._symbol = symbol;
        let _resolve: (broker?: ByBitBroker) => void;
        let _reject: (reason: any) => void;
        const promise = new Promise<ByBitBroker | undefined>((resolver, rejector) => { _resolve = resolver; _reject = rejector; });

        this._authSuccess = false;

        const resolve: (broker?: ByBitBroker) => void = () => {
            this._isLive = true;
            this.connecting = false;
            this.initWebsocket();
            _resolve(this.broker);
        };

        const reject: (reason: any) => void = (reason) => {
            this.connecting = false;
            this.initWebsocket();
            _reject(reason);
        };

        if (this.connecting) {
            throw new Error("Already connecting");
        }

        if (this._isLive) {
            throw new Error("Already connected to exchange");
        }

        this.connecting = true;

        this.webSocket = new WebSocket(this.websocketEndpoint);

        this._api = new ByBitApi(this.network, this.isTestnet, this.auth || { ApiKey: "", Secret: "" });

        this.webSocket.onopen = () => {
            console.log("Bybit: Connection opened");

            if (this.auth) {
                const expires = new Date().getTime() + 10000;
                const signature = crypto.createHmac("sha256", this.auth.Secret).update("GET/realtime" + expires).digest("hex");
                this.webSocket.send(JSON.stringify({ "op": "auth", "args": [this.auth.ApiKey, expires, signature] }));

                this.webSocket.onmessage = (event) => {
                    if (event.type === "message") {
                        const data = JSON.parse(event.data.toString());

                        if (!this.authSuccess) {
                            if ("success" in data && data.success === false) {
                                reject(data);
                            } else if ("success" in data && data.success === true) {
                                if (data.request && data.request.op === "auth") {
                                    if (!this.authSuccess) {

                                        console.log("Bybit: Auth successful");

                                        // await order
                                        // await balance and position;
                                        // await current leverage

                                        this._authSuccess = true;

                                        this.webSocket.send(JSON.stringify({ "op": "subscribe", "args": ["order", "position", "execution", "private.wallet"] }));

                                        Promise.all([
                                            this.api.GetActiveOrder({
                                                order_status: "Created,New,PartiallyFilled",
                                                symbol: this._symbol,
                                                // Todo: consolidate if more than 50 open orders present
                                                limit: 50
                                            }),
                                            this.api.GetConditionalOrder({
                                                limit: 50,
                                                symbol: this._symbol
                                            }),
                                            this.api.MyPosition({}),
                                            this.api.UserLeverage({}),
                                            this.api.GetWalletFundRecords({
                                                currency: this.symbolToCurrencyMap[this._symbol],
                                                limit: 1
                                            })
                                        ]).then((response) => {
                                            // 10002, timestamp was too less

                                            const rejectionReason = this.initAccount(response);

                                            if (!rejectionReason) {
                                                this._broker = (global as any).broker = new ByBitBroker(this);
                                                resolve(this._broker);
                                            } else {
                                                reject(rejectionReason);
                                            }

                                        }, (reason) => {
                                            reject(reason);
                                        });
                                    }
                                }
                            } else {
                                reject(data);
                            }
                        }
                    }
                };
            } else {
                resolve(undefined);
            }
        };

        return promise;
    }

    public subscribeCandle(resolutionSet: Resolution[]): CandleQueue {
        if (!this._isLive) {
            throw new Error("Not connected to exchange.");
        }

        if (this.subscribedResolutions) {
            throw new Error("Already subscribed to " + JSON.stringify(this.subscribedResolutions));
        }

        const unsupportedResolutions = resolutionSet.filter(val => !this.LiveSupportedResolutions.includes(val));
        if (unsupportedResolutions.length > 0) {
            throw new Error("Unsupported resolution(s): " + JSON.stringify(unsupportedResolutions));
        }

        this.subscribedResolutions = resolutionSet;

        // Todo: Symbol is hardcoded
        this.webSocket.send(JSON.stringify({ "op": "subscribe", "args": ["kline.BTCUSD." + this.subscribedResolutions.join("|")] }));

        return this.candleQueue = new CandleQueue(this.subscribedResolutions);
    }

    public async getData(endTick: number, duration: number, resolution: Resolution): Promise<Candle[]> {
        console.log("ByBit", "getData", endTick, endTick - duration, resolution);

        const res = this.resolutionMap(resolution);

        if (res == null) {
            console.error("Unsupported resolution:", res[0]);
            return Promise.reject("Unsupported resolution");
        }

        const from = Math.floor((endTick - duration) / 1000);
        const to = Math.floor(endTick / 1000);

        try {
            const data = await this.api.Kline({
                symbol: "BTCUSD",
                interval: res[0],
                from: from,
                to: to
            });

            if (data.result) {
                const candleData = data.result.map<Candle>((result) => {
                    const startTick = result.open_time;

                    return {
                        StartTick: startTick * 1000,
                        EndTick: (startTick) * 1000 + res[1],
                        High: parseFloat(result.high),
                        Open: parseFloat(result.open),
                        Close: parseFloat(result.close),
                        Low: parseFloat(result.low),
                        Volume: parseFloat(result.volume)
                    } as Candle;
                });

                // TODO: this is fucked, it gets set everytime, for every resolution
                // or maybe not since it's setting the last close price
                this._lastPrice = candleData[candleData.length - 1].Close;

                return Promise.resolve(candleData);
            } else {
                console.error(data);
                return Promise.reject(data);
            }
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    private initWebsocket() {

        this.webSocket.onmessage = (event) => {
            if (event.type === "message") {
                const data = JSON.parse(event.data.toString());

                if ("success" in data && data.success === true) {
                    if (data.request && data.request.op === "auth") {
                        //
                    }
                } else if (data.topic && data.topic.startsWith("kline.")) {
                    // console.log(new Date().getTime(), "Bybit: websocket data")

                    const candle: Candle = {
                        StartTick: data.data.open_time * 1000,
                        EndTick: null,
                        High: data.data.high,
                        Open: data.data.open,
                        Close: data.data.close,
                        Low: data.data.low,
                        Volume: data.data.volume
                    };

                    this._lastPrice = candle.Close;

                    const candleUpdate: ResolutionMapped<Candle> = {};
                    candleUpdate[data.data.interval as Resolution] = candle;

                    this.candleQueue.push(candleUpdate);
                } else if (data.data && data.topic && data.topic.toLowerCase() === "execution") {

                    const executions = data.data;
                    console.log("executions");
                    console.log(executions);

                    /*
                        {
                            "topic":"execution",
                            "data":[
                                {
                                    "symbol":"BTCUSD",
                                    "side":"Sell",
                                    "order_id":"xxxxxxxx-xxxx-xxxx-9a8f-4a973eb5c418",
                                    "exec_id":"xxxxxxxx-xxxx-xxxx-8b66-c3d2fcd352f6",
                                    "order_link_id":"xxxxxxx",
                                    "price":3559,
                                    "exec_qty":1028,
                                    "exec_fee":-0.00007221,
                                    "leaves_qty":0,
                                    "is_maker":true,
                                    "trade_time":"2019-01-22T14:49:38.000Z"
                                },
                            ]
                        }
                    */

                } else if (data.data && data.topic && data.topic.toLowerCase() === "order") {

                    const orders = data.data as ByBitWebsocketContracts["Order"];

                    const accountUpdate: Partial<IAccount> = {
                        Orders: {}
                    };

                    orders.filter((order) => order.symbol === this._symbol).forEach((order) => {
                        accountUpdate.Orders![order.order_id] = {
                            OrderId: order.order_id,
                            Side: order.side,
                            Symbol: order.symbol,
                            OrderType: order.order_type,
                            OrderStatus: order.order_status,
                            Quantity: order.qty,
                            FilledRemaining: order.leaves_qty,
                            Price: parseFloat(order.price),
                            TimeInForce: order.time_in_force,
                            CreatedAt: this.account.Orders[order.order_id] ? this.account.Orders[order.order_id].CreatedAt : order.timestamp,
                            UpdatedAt: order.timestamp,
                            Closed: order.order_status === ("Created" || order.order_status === "New" || order.order_status === "PartiallyFilled") ? false : true
                        };
                    });
                } else if (data.data && data.topic && data.topic.toLowerCase() === "position") {
                    const positionsRaw = data.data as ByBitWebsocketContracts["Position"];

                    const accountUpdate: Partial<IAccount> = {
                        Positions: {}
                    };

                    const position = positionsRaw.filter(position => position.symbol === this._symbol)[0];

                    if (position) {
                        accountUpdate.Positions![this._symbol] = {
                            Symbol: position.symbol,
                            PositionId: 0,
                            Side: position.side,
                            Size: position.size,
                            PositionValue: parseFloat(position.position_value),
                            EntryPrice: parseFloat(position.entry_price),
                            Leverage: parseFloat(position.leverage),
                            AutoAddMargin: !!position.auto_add_margin,
                            PositionMargin: parseFloat(position.position_margin),
                            LiquidationPrice: parseFloat(position.liq_price),
                            BankrupcyPrice: parseFloat(position.bust_price),
                            ClosingFee: parseFloat(position.occ_closing_fee),
                            FundingFee: parseFloat(position.occ_funding_fee),
                            TakeProfit: parseFloat(position.take_profit),
                            StopLoss: parseFloat(position.stop_loss),
                            TrailingStop: parseFloat(position.trailing_stop),
                            PositionStatus: position.position_status,
                            UpdatedAt: new Date().getTime().toString(),
                            Closed: position.side === "None"
                        };
                    }

                } else if (data && data.topic && data.topic.toLowerCase() === "private.wallet") {
                    const wallet = (data.data as ByBitWebsocketContracts["Wallet"]).filter(wallets => wallets.symbol === this._symbol)[0];

                    if (wallet) {
                        this.account.update({
                            Wallet: {
                                Balance: wallet.wallet_balance,
                                OrderMargin: wallet.order_margin,
                                PositionMargin: wallet.position_margin,
                                AvailableMargin: Decimal.sub(wallet.wallet_balance, wallet.order_margin || 0)
                                    .sub(wallet.position_margin || 0)
                                    .sub(wallet.occ_closing_fee || 0)
                                    .sub(wallet.occ_funding_fee || 0).toNumber()
                            }
                        });
                    }
                } else {
                    console.log("unknown", data.data);
                }
            }
        };

        this.webSocket.onclose = (e) => {
            console.log("Bybit: Connection closed.");
            console.log("Bybit: Retrying in 500ms.");

            this._isLive = false;

            // retry connecting after some second to not bothering on high load
            setTimeout(() => {
                console.log("Bybit: Retrying.");
                this.connect(this._symbol, this.auth).then((success) => { /* */ }, (reason) => {
                    console.log("Bybit: Retry rejection, reason: " + reason);
                    this.distessSignal.set();
                });
            }, 500);
        };

    }

    /**
     * Initialize account from connection response
     * @param response the response from the apis to get account trading details
     * @returns null if everything was okay, reason as string if something went wrong
     */
    private initAccount(response: ConnectionResponse): string | null {
        const apiErrors = [];

        const orderResponse = response[0];
        const stopOrderResponse = response[1];
        const positionReponse = response[2];
        const userLeverageResponse = response[3];
        const walletResponse = response[4];

        const accountUpdate: Partial<IAccount> = {};

        if (userLeverageResponse.ret_code === 0) {
            const leverage = userLeverageResponse.result;
            if (this.account.Leverage !== leverage[this._symbol].leverage) {
                accountUpdate.Leverage = leverage[this._symbol].leverage;
            }
        }

        if (walletResponse.ret_code === 0) {
            if (walletResponse.result.data.length) {

                // walletResponse.result.data[0].wallet_balance;

                accountUpdate.Wallet = {
                    Balance: walletResponse.result.data[0].wallet_balance
                };

            } else {
                apiErrors.push(`GetWalletFundRecords-${this.symbolToCurrencyMap[this._symbol]}: ${walletResponse.ret_msg}.`);
            }
        }

        if (orderResponse.ret_code === 0) {
            const orders = orderResponse.result.data;
            accountUpdate.Orders = {};

            const existingOrders = Object.values(this.account.Orders);

            // Existing orders will be there only if initAccount was called for reconnection
            // This might cause some of the values in closed orders to be stale

            // Assume all orders are closed
            existingOrders.forEach(order => {
                if (!order.Closed) {
                    accountUpdate.Orders![order.OrderId] = {
                        ...order,
                        Closed: true
                    };
                }
            });

            // Will override orders with updated values if they were actual open
            if (orders) {
                orders.forEach(order => {
                    if (accountUpdate.Orders![order.order_id] && this.account.Orders[order.order_id].UpdatedAt === order.updated_at) {
                        // Remove since there has been no change in the order
                        delete accountUpdate.Orders![order.order_id];
                    } else {
                        accountUpdate.Orders![order.order_id] = {
                            OrderId: order.order_id,
                            Side: order.side,
                            Symbol: order.symbol,
                            OrderType: order.order_type,
                            OrderStatus: order.order_status,
                            Quantity: order.qty,
                            FilledRemaining: order.leaves_qty,
                            Price: order.price,
                            TimeInForce: order.time_in_force,
                            CreatedAt: order.created_at,
                            UpdatedAt: order.updated_at,
                            Closed: false
                        };
                    }
                });
            }
        } else {
            apiErrors.push("GetActiveOrders: " + orderResponse.ret_msg);
        }

        if (stopOrderResponse.ret_code === 0) {
            // conditional orders
            const orders = stopOrderResponse.result.data;
        }

        if (positionReponse.ret_code === 0) {
            const positions = positionReponse.result.filter((position) => position.symbol === this._symbol);
            accountUpdate.Positions = {};

            const existingPositions = this.account.Positions;

            const position = positions.filter((position) => position.symbol === this._symbol && position.side !== "None")[0];

            if (existingPositions[this._symbol] && existingPositions[this._symbol].Side !== "None" && !position) {
                // Position was closed
                accountUpdate.Positions[this._symbol] = {
                    ...this.account.Positions[this._symbol],
                    Closed: true
                };
            } else if (position) {
                accountUpdate.Positions[this._symbol] = {
                    Symbol: position.symbol,
                    PositionId: 0,
                    Side: position.side,
                    Size: position.size,
                    PositionValue: position.position_value,
                    EntryPrice: position.entry_price,
                    Leverage: position.leverage,
                    AutoAddMargin: !!position.auto_add_margin,
                    PositionMargin: position.position_margin,
                    LiquidationPrice: position.liq_price,
                    BankrupcyPrice: position.bust_price,
                    ClosingFee: position.occ_closing_fee,
                    FundingFee: position.occ_funding_fee,
                    TakeProfit: position.take_profit,
                    StopLoss: position.stop_loss,
                    TrailingStop: position.trailing_stop,
                    PositionStatus: position.position_status,
                    UpdatedAt: position.updated_at,
                    Closed: false
                };

                if (position.side !== "None") {
                    accountUpdate.Wallet!.Balance = position.wallet_balance;
                    accountUpdate.Wallet!.OrderMargin = position.order_margin;
                    accountUpdate.Wallet!.PositionMargin = position.position_margin;
                    accountUpdate.Wallet!.AvailableMargin = Decimal.sub(position.wallet_balance, position.order_margin)
                        .sub(position.position_margin)
                        .sub(position.occ_closing_fee)
                        .sub(position.occ_funding_fee).toNumber();
                }

            }

            // side: None == closed
            // side: Buy/Sell == open

            // if position has been closed only update realized pnl
            console.log(positions);
        } else {
            apiErrors.push("MyPosition: " + positionReponse.ret_msg);
        }

        if (apiErrors.length) {
            return apiErrors.join("\n");
        }

        this.account.update(accountUpdate);

        return null;
    }

    private resolutionMap(resolution: Resolution): [string, number] {
        const tickValue = Utils.GetResolutionTick(resolution);

        switch (resolution) {
            case "1m":
                return ["1", tickValue];
            case "3m":
                return ["3", tickValue];
            case "5m":
                return ["5", tickValue];
            case "15m":
                return ["15", tickValue];
            case "30m":
                return ["30", tickValue];
            case "1h":
                return ["60", tickValue];
            case "2h":
                return ["120", tickValue];
            case "4h":
                return ["240", tickValue];
            case "1d":
                return ["D", Tick.Day];
            default:
                throw new Error("Unsupported resolution for getting base data");
        }
    }
}