import * as crypto from 'crypto';
import { Candle, ExchangeAuth, Resolution } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { Tick } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { Utils } from "Model/Utils/Utils";
import * as WebSocket from 'ws';
import { ByBitBroker } from './ByBitBroker';

interface CandleResult {
    id: number,
    symbol: string,
    period: string,
    start_at: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    turnover: number,
    cross_seq: number,
    time: number
}

interface SymbolResponse {
    ret_code: any,
    ret_msg: any,
    ext_code: any,
    result: CandleResult[]
}

const ErrorCodes = [
    10001, 10002, 10003, 10004, 10005, 10006, 10010, 20001, 20003, 20004, 20005, 20006, 20007, 20008,
    20009, 20010, 20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020, 20021, 30001,
    30002, 30003, 30004, 30005, 30006, 30007, 30008, 30009, 30010, 30011, 30012, 30013, 30014, 30015,
    30016, 30017, 30018, 30019, 30020, 30021, 30022, 30023, 30024, 30025, 30026, 30027, 30028, 30029,
    30030, 30031, 30032, 30033, 30034, 30035, 30036, 30037, 30041, 30042, 30043, 30044, 30045, 30057,
    30063, 20022, 20023, 20031, 20070, 20071, 30040, 30049, 30050, 30051, 30052, 30054, 30067, 30068
]

export class ByBitExchange extends Exchange {

    public get lastPrice(): number { return this._lastPrice; }
    public get isLive(): boolean { return this._isLive; }

    public readonly broker: ByBitBroker;

    protected websocketEndpoint: string = "wss://stream-testnet.bybit.com/realtime";
    protected baseApiEndpoint: string = "https://api2.bybit.com";
    
    private subscribedResolutions: Resolution[];
    private dataQueue: CandleQueue;
    private auth: ExchangeAuth;
    private connecting: boolean = false;

    private readonly LiveSupportedResolutions: string[] = [
        "1m", "3m", "5m", "15m", "30m",
        "1h", "2h", "3h", "4h", "6h",
        "1d", "3d",
        "1w", "2w",
        "1M"
    ];
    
    private _isLive: boolean = false;
    private _lastPrice: number = 0;

    private webSocket: WebSocket;
    
    constructor(protected network: INetwork) {
        super(network);

        this.broker = new ByBitBroker(this);
    }

    public async connect(auth?: ExchangeAuth): Promise<void> {
        let _resolve: () => void;
        let _reject: (reason: any) => void;
        const promise = new Promise<void>((resolver, rejector) => { _resolve = resolver; _reject = rejector; });
        this.auth = auth;
        
        let resolve: () => void = () => {
            this._isLive = true;
            this.connecting = false;
            this.initWebsocket();
            _resolve();
        };

        let reject: (reason: any) => void = (reason) => {
            this.connecting = false;
            this.initWebsocket()
            _reject(reason);
        };

        if(this.connecting) {
            throw new Error("Already connecting")
        }

        if(this._isLive) {
            throw new Error("Already connected to exchange");
        }

        this.connecting = true;

        this.webSocket = new WebSocket(this.websocketEndpoint);
        
        this.webSocket.onopen = () => {
            console.log('Bybit: Connection opened');

            if(this.auth) {
                let expires = new Date().getTime() + 10000;
                let signature = crypto.createHmac('sha256', this.auth.Secret).update('GET/realtime' + expires).digest('hex');

                this.webSocket.send(JSON.stringify({'op': 'auth', 'args': [this.auth.ApiKey + 1, expires, signature]}));

                this.webSocket.onmessage = (event) => {
                    if (event.type === 'message') {
                        let data = JSON.parse(event.data.toString());
        
                        if ('success' in data && data.success === false) {
                            reject(data);
                        } else if ('success' in data && data.success === true) {
                            if (data.request && data.request.op === 'auth') {
                                if(!this.authSuccess) {
                                        
                                    console.log('Bybit: Auth successful');

                                    // await order
                                    // await balance and position;
                                    // await current leverage

                                    this.setAuthSuccess({
                                        Position: null,
                                        Balance: 0,
                                        Leverage: 0,
                                    })
        
                                    this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['order']}))
                                    this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['position']}))
                                    this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['execution']}))
        
                                    resolve();
                                }
                            }
                        } else {
                            reject(data);
                        }
                    }
                };
            } else {
                resolve();
            }
        }

        return promise;
    }

    public getCandleQueue(resolutionSet: Resolution[]): Promise<CandleQueue> {
        let resolver: (value: CandleQueue) => void;
        const promise = new Promise<CandleQueue>((resolve) => {
            resolver = resolve;
        });

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
        
        const symbol = "BTCUSD";

        this.subscribedResolutions = resolutionSet;
      
        this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['kline.' + symbol + '.' + this.subscribedResolutions.join("|")]}));

        resolver(this.dataQueue = new CandleQueue(this.subscribedResolutions));

        return promise;
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

        const endpoint = `${this.baseApiEndpoint}/kline/list?symbol=BTCUSD&resolution=${res[0]}&from=${from}&to=${to}`;

        try {
            const response = await this.network.get(endpoint);

            const data = JSON.parse(response.response) as SymbolResponse;

            if (data.result) {
                const candleData = data.result.map((result: CandleResult): Candle => {
                    const startTick = result.start_at;

                    return {
                        StartTick: startTick * 1000,
                        EndTick: (startTick + res[1]) * 1000,
                        High: result.high,
                        Open: result.open,
                        Close: result.close,
                        Low: result.low,
                        Volume: result.volume
                    } as Candle;
                });

                this._lastPrice = candleData[candleData.length - 1].Close;

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

                if ('success' in data && data.success === false) {
                    console.error('Bybit: error ' + event.data)
                } else if ('success' in data && data.success === true) {
                    if (data.request && data.request.op === 'auth') {
                        if(!this.authSuccess) {
                                
                            console.log('Bybit: Auth successful');

                            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['order']}))
                            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['position']}))
                            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['execution']}))
                        }
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

                    this._lastPrice = candle.Close;

                    this.dataQueue.push(data.data.interval, candle);
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
                } else {
                    console.log('unknown', data.data);
                }
            }
        };

        this.webSocket.onclose = () => {
            console.log('Bybit: Connection closed.');
            console.log('Bybit: Retrying in 500ms.');

            this._isLive = false;

            // retry connecting after some second to not bothering on high load
            setTimeout(() => {
                console.log('Bybit: Retrying.')
                this.connect(this.auth).then((success) => { }, (reason) => {
                    console.log('Bybit: Retry rejection, reason: ' + reason);
                    this.distessSignal.set();
                });
            }, 500);
        };

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