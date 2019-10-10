import * as crypto from 'crypto';
import { Candle, ExchangeAuth, Resolution, Order, Wallet, Position, ResolutionMapped, Dictionary } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { Tick } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/Queue";
import { Utils } from "Model/Utils/Utils";
import * as WebSocket from 'ws';
import { ByBitBroker } from './ByBitBroker';
import { ByBitApi } from './ByBitApi';
import { ByBitContracts, Symbol } from './ByBitContracts';

type ConnectionResponse = [
    ByBitContracts['GetActiveOrder']['Response'],
    ByBitContracts['GetConditionalOrder']['Response'],
    ByBitContracts['MyPosition']['Response'],
    ByBitContracts['GetWalletFundRecords']['Response'],
    ByBitContracts['GetWalletFundRecords']['Response'],
    ByBitContracts['GetWalletFundRecords']['Response'],
    ByBitContracts['GetWalletFundRecords']['Response']
];

const ErrorCodes = [
    10001, 10002, 10003, 10004, 10005, 10006, 10010, 20001, 20003, 20004, 20005, 20006, 20007, 20008,
    20009, 20010, 20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020, 20021, 30001,
    30002, 30003, 30004, 30005, 30006, 30007, 30008, 30009, 30010, 30011, 30012, 30013, 30014, 30015,
    30016, 30017, 30018, 30019, 30020, 30021, 30022, 30023, 30024, 30025, 30026, 30027, 30028, 30029,
    30030, 30031, 30032, 30033, 30034, 30035, 30036, 30037, 30041, 30042, 30043, 30044, 30045, 30057,
    30063, 20022, 20023, 20031, 20070, 20071, 30040, 30049, 30050, 30051, 30052, 30054, 30067, 30068
]

export interface ByBitEndpoints {
    websocket: string;
    kline: string;

}

export class ByBitExchange extends Exchange {

    public get isLive(): boolean { return this._isLive; }
    public get broker(): ByBitBroker { return this._broker; }
    public get authSuccess(): boolean { return this._authSuccess; }

    public get lastPrice(): number { return this._lastPrice; };
    public get marketPrice(): number { return this._marketPrice; };

    protected websocketEndpoint: string = "wss://stream-testnet.bybit.com/realtime";
    protected api: ByBitApi;

    private _isLive: boolean = false;
    private _broker: ByBitBroker;
    private _authSuccess: boolean;
    private _lastPrice: number;
    private _marketPrice: number;

    private subscribedResolutions: Resolution[];
    private candleQueue: CandleQueue;
    private auth: ExchangeAuth;
    private connecting: boolean = false;
    private webSocket: WebSocket;
    private symbol: Symbol;

    private readonly LiveSupportedResolutions: string[] = [
        "1m", "3m", "5m", "15m", "30m",
        "1h", "2h", "3h", "4h", "6h",
        "1d", "3d",
        "1w", "2w",
        "1M"
    ];

    constructor(protected network: INetwork) {
        super(network);
        this.api = new ByBitApi(this.network, false);
    }

    public getSymbolList() {
        return ["BTCUSD", "ETHUSD", "XRPUSD", "EOSUSD"];
    }

    public async connect(symbol: Symbol, auth?: ExchangeAuth): Promise<ByBitBroker | undefined> {
        this.auth = auth;
        this.symbol = symbol;
        
        let _resolve: (broker?: ByBitBroker) => void;
        let _reject: (reason: any) => void;
        const promise = new Promise<ByBitBroker | undefined>((resolver, rejector) => { _resolve = resolver; _reject = rejector; });

        this._authSuccess = false;

        let resolve: (broker?: ByBitBroker) => void = () => {
            this._isLive = true;
            this.connecting = false;
            this.initWebsocket();
            _resolve(this.broker);
        };

        let reject: (reason: any) => void = (reason) => {
            this.connecting = false;
            this.initWebsocket()
            _reject(reason);
        };

        if (this.connecting) {
            throw new Error("Already connecting")
        }

        if (this._isLive) {
            throw new Error("Already connected to exchange");
        }

        this.connecting = true;

        this.webSocket = new WebSocket(this.websocketEndpoint);

        this.webSocket.onopen = () => {
            console.log('Bybit: Connection opened');

            if (this.auth) {
                let expires = new Date().getTime() + 10000;
                let signature = crypto.createHmac('sha256', this.auth.Secret).update('GET/realtime' + expires).digest('hex');
                this.webSocket.send(JSON.stringify({ 'op': 'auth', 'args': [this.auth.ApiKey, expires, signature] }));

                this.webSocket.onmessage = (event) => {
                    if (event.type === 'message') {
                        let data = JSON.parse(event.data.toString());

                        if (!this.authSuccess) {
                            if ('success' in data && data.success === false) {
                                reject(data);
                            } else if ('success' in data && data.success === true) {
                                if (data.request && data.request.op === 'auth') {
                                    if (!this.authSuccess) {

                                        console.log('Bybit: Auth successful');

                                        // await order
                                        // await balance and position;
                                        // await current leverage

                                        this._authSuccess = true;

                                        this.webSocket.send(JSON.stringify({ 'op': 'subscribe', 'args': ['order', 'position', 'execution', 'private.wallet'] }));

                                        
                                        Promise.all([
                                            this.api.GetActiveOrder({
                                                order_status: "Created,New,PartiallyFilled",
                                                
                                                // Todo: consolidate if more than 50 open orders present
                                                limit: 50
                                            }, this.auth),
                                            this.api.GetConditionalOrder({
                                                limit: 50
                                            }, this.auth),
                                            this.api.MyPosition({}, this.auth),
                                            this.api.GetWalletFundRecords({
                                                currency: 'BTC',
                                                limit: 1
                                            }, this.auth),
                                            this.api.GetWalletFundRecords({
                                                currency: 'ETH',
                                                limit: 1
                                            }, this.auth),
                                            this.api.GetWalletFundRecords({
                                                currency: 'XRP',
                                                limit: 1
                                            }, this.auth),
                                            this.api.GetWalletFundRecords({
                                                currency: 'EOS',
                                                limit: 1
                                            }, this.auth)
                                        ]).then((response) => {
                                            // 10002, timestamp was too less
                                            
                                            const rejectionReason = this.initAccount(response);

                                            if(!rejectionReason) {
                                                resolve(this._broker = new ByBitBroker(this));
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
                resolve(null);
            }
        }

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
        this.webSocket.send(JSON.stringify({ 'op': 'subscribe', 'args': ['kline.BTCUSD.' + this.subscribedResolutions.join("|")] }));

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
                symbol: 'BTCUSD',
                interval: res[0],
                from: from,
                to: to
            });


            if (data.result) {
                const candleData = data.result.map<Candle>((result) => {
                    const startTick = result.open_time;

                    return {
                        StartTick: startTick * 1000,
                        EndTick: (startTick + res[1]) * 1000,
                        High: parseFloat(result.high),
                        Open: parseFloat(result.open),
                        Close: parseFloat(result.close),
                        Low: parseFloat(result.low),
                        Volume: parseFloat(result.volume)
                    } as Candle;
                });

                // this._lastPrice = candleData[candleData.length - 1].Close;

                return Promise.resolve(candleData);
            } else {
                console.error(data);
                return Promise.reject(data);
            }
        } catch (err) {
            console.error(err);
            return Promise.reject(err)
        }
    }

    private initWebsocket() {

        this.webSocket.onmessage = (event) => {
            if (event.type === 'message') {
                let data = JSON.parse(event.data.toString());

                if ('success' in data && data.success === true) {
                    if (data.request && data.request.op === 'auth') {
                    }
                } else if (data.topic && data.topic.startsWith('kline.')) {
                    // console.log(new Date().getTime(), "Bybit: websocket data")

                    const candle: Candle = {
                        StartTick: data.data.open_time * 1000,
                        EndTick: null,
                        High: data.data.high,
                        Open: data.data.open,
                        Close: data.data.close,
                        Low: data.data.low,
                        Volume: data.data.volume
                    }

                    // this._lastPrice = candle.Close;

                    const candleUpdate: ResolutionMapped<Candle> = {};
                    candleUpdate[data.data.interval as Resolution] = candle;

                    this.candleQueue.push(candleUpdate);
                } else if (data.data && data.topic && data.topic.toLowerCase() === 'execution') {

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

                } else if (data.data && data.topic && data.topic.toLowerCase() === 'order') {

                    const orders = data.data;
                    console.log("orders");
                    console.log(orders);

                    /*
                        {
                            "topic":"order",
                            "data":[
                                {
                                    "order_id":"xxxxxxxx-xxxx-xxxx-832b-1eca710bf0a6",
                                    "order_link_id":"xxxxxxxx",
                                    "symbol":"BTCUSD",
                                    "side":"Sell",
                                    "order_type":"Limit",
                                    "price":3559.5,
                                    "qty":850,
                                    "time_in_force":"GoodTillCancel",
                                    "order_status":"Cancelled",
                                    "leaves_qty":0,
                                    "cum_exec_qty":0,
                                    "cum_exec_value":0,
                                    "cum_exec_fee":0,
                                    "timestamp":"2019-01-22T14:49:38.000Z"
                                }
                            ]
                        }
                    */

                } else if (data.data && data.topic && data.topic.toLowerCase() === 'position') {
                    const positionsRaw = data.data;

                    console.log("position");
                    console.log(positionsRaw);

                    /*
                        {
                            "topic":"position",
                            "action":"update",
                            "data":[
                                {
                                    "symbol":"BTCUSD",                  // the contract for this position
                                    "side":"Sell",                      // side
                                    "size":11,                          // the current position amount
                                    "entry_price":6907.291588174717,    // entry price
                                    "liq_price":7100.234,               // liquidation price
                                    "bust_price":7088.1234,             // bankruptcy price
                                    "take_profit":0,                    // take profit price
                                    "stop_loss":0,                      // stop loss price
                                    "trailing_stop":0,                  // trailing stop points
                                    "position_value":0.00159252,        // positional value
                                    "leverage":1,                       // leverage
                                    "position_status":"Normal",         // status of position (Normal:normal Liq:in the process of liquidation Adl:in the process of Auto-Deleveraging)
                                    "auto_add_margin":0,                // Auto margin replenishment enabled (0:no 1:yes)
                                    "position_seq":14                   // position version number
                                }
                            ]
                        }
                        
                        let positions = []
                        positionsRaw.forEach(positionRaw => {
                            if (!['buy', 'sell'].includes(positionRaw['side'].toLowerCase())) {
                                delete me.positions[positionRaw.symbol]
                            } else {
                                positions.push(positionRaw)
                            }
                        })

                        Bybit.createPositionsWithOpenStateOnly(positions).forEach(position => {
                            me.positions[position.symbol] = position
                        })
                    */
                } else if (data && data.topic && data.topic.toLowerCase() == "private.wallet") {
                    const wallet = data.data;

                    console.log("wallet");
                    console.log(wallet);
                    /*
                        {
                            "topic": "private.wallet",
                            "data": [
                                {
                                    "symbol": "BTCUSD",
                                    "wallet_balance": 0.24347523,
                                    "used_margin": 0.01271277,
                                    "available_balance": 0.23076245999999997,
                                    "order_margin": 0,
                                    "cum_realised_pnl": 0.01347523,
                                    "position_margin": 0.01260875,
                                    "occ_closing_fee": 0.00010402,
                                    "occ_funding_fee": 0,
                                    "risk_id": 1,
                                    "risk_section": [
                                        "1",
                                        "2",
                                        "3",
                                        "5",
                                        "10",
                                        "25",
                                        "50",
                                        "100"
                                    ],
                                    "cross_seq": 254058651,
                                    "position_seq": 95872583,
                                    "realised_pnl": 0.00165942
                                }
                            ],
                            "user_id": 105455
                        }
                    */
                }
                else {
                    console.log('unknown', data.data);
                }
            }
        };

        this.webSocket.onclose = (e) => {
            console.log('Bybit: Connection closed.');
            console.log('Bybit: Retrying in 500ms.');

            this._isLive = false;

            // retry connecting after some second to not bothering on high load
            setTimeout(() => {
                console.log('Bybit: Retrying.')
                this.connect(this.symbol, this.auth).then((success) => { }, (reason) => {
                    console.log('Bybit: Retry rejection, reason: ' + reason);
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
    private initAccount(response: ConnectionResponse): string {
        const apiErrors = [];

        const orderResponse = response[0];
        const stopOrderResponse = response[1]
        const positionReponse = response[2];

        const walletRecords: Array<[string, ByBitContracts['GetWalletFundRecords']['Response']]> = [
            ['BTC', response[3]],
            ['ETH', response[4]],
            ['XRP', response[5]],
            ['EOS', response[6]],
        ];

        walletRecords.forEach(walletRecord => {
            if(walletRecord[1].ret_code == 0) {
                if(walletRecord[1].result.data.length) {
                    // this.walletBalance.addOrUpdate(walletRecord[0], {
                    //     Currency: walletRecord[0],
                    //     Balance: walletRecord[1].result.data[0].wallet_balance,
                        
                    //     // Can't figure out order margin and position margin from this
                    //     // will have to rely on orders and position
                    //     OrderMargin: 0,
                    //     PositionMargin: 0,
                    // })
                } else {
                    apiErrors.push(`GetWalletFundRecords-${walletRecord[0]}: ${walletRecord[1].ret_msg}.`);
                }
            }
        })


        if(orderResponse.ret_code == 0) {
            const orders = orderResponse.result.data;

            orders.forEach(order => {
                // this.orders.addOrUpdate(order.order_id, {
                //     OrderId: order.order_id,
                //     Side: order.side,
                //     Symbol: order.symbol,
                //     OrderType: order.order_type,
                //     OrderStatus: order.order_status,
                //     Quantity: order.qty,
                //     FilledQuantity: order.qty - order.leaves_qty,
                //     Price: order.price,
                //     TimeInForce: order.time_in_force,
                //     // TakeProfit: order.
                // });
            });
        } else {
            apiErrors.push("GetActiveOrders: " + orderResponse.ret_msg);
        }

        if(stopOrderResponse.ret_code == 0) {
            const orders = stopOrderResponse.result.data;
        }
        
        if(positionReponse.ret_code == 0) {
            // process positions
        } else {
            apiErrors.push("MyPosition: " + positionReponse.ret_msg);
        }
    }

    private bybitSymbolToCurrencyMap(symbol: Symbol) {
        switch(symbol) {
            case 'BTCUSD':
                return 'BTC';
            case 'EOSUSD':
                return 'EOS';
            case 'ETHUSD':
                return 'ETH';
            case 'XRPUSD':
                return 'XRP';
            default:
                return symbol;
        }
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