import * as crypto from 'crypto';
import { Candle, ExchangeAuth, Resolution } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { IBroker } from "Model/Exchange/IBroker";
import { Tick } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
import { Utils } from "Model/Utils/Utils";
import * as WebSocket from 'ws';

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

    public readonly Broker: IBroker;

    private subscribedResolutions: Resolution[];
    private dataQueue: CandleQueue;
    
    private readonly LiveSupportedResolutions: string[] = [
        "1m", "3m", "5m", "15m", "30m",
        "1h", "2h", "3h", "4h", "6h",
        "1d", "3d",
        "1w", "2w",
        "1M"
    ];
    
    private _isLive: boolean = false;
    private _lastPrice: number = 0;
    private _authSuccess: boolean = false;

    private webSocket: WebSocket;

    protected webSocketAddress: string = "wss://stream-testnet.bybit.com/realtime";
    
    constructor(protected network: INetwork, auth?: ExchangeAuth) {
        super(network, auth);
    }

    public get lastPrice(): number {
        return this._lastPrice
    }

    public get isLive(): boolean {
        return this._isLive;
    }

    public get authSuccess(): boolean {
        return this._authSuccess;
    }

    public start(resolutionSet: Resolution[]): Promise<CandleQueue> {
        let resolver: (value: CandleQueue) => void;
        const promise = new Promise<CandleQueue>((resolve) => {
            resolver = resolve;
        })

        if(this._isLive) {
            throw new Error("Already connected to exchange");
        }

        const unsupportedResolutions = resolutionSet.filter(val => !this.LiveSupportedResolutions.includes(val));

        if(unsupportedResolutions.length > 0) {
            throw new Error("Unsupported resolution(s): " + JSON.stringify(unsupportedResolutions));
        }
        
        this.subscribedResolutions = resolutionSet;
        this.webSocket = new WebSocket(this.webSocketAddress);
        
        this.webSocket.onopen = () => {
            const symbol = "BTCUSD";
            console.log('Bybit: Connection opened');

            if(this.auth) {
                let expires = new Date().getTime() + 10000;
                let signature = crypto.createHmac('sha256', this.auth.Secret).update('GET/realtime' + expires).digest('hex');

                this.webSocket.send(JSON.stringify({'op': 'auth', 'args': [this.auth.ApiKey, expires, signature]}));
            }

            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['kline.' + symbol + '.' + this.subscribedResolutions.join("|")]}));

            this._isLive = true;

            resolver(this.dataQueue = new CandleQueue(this.subscribedResolutions));
        }
        
        this.webSocket.onmessage = (event) => {
            if (event.type === 'message') {
                let data = JSON.parse(event.data.toString());

                if ('success' in data && data.success === false) {
                    console.error('Bybit: error ' + event.data)
                } else if ('success' in data && data.success === true) {
                    if (data.request && data.request.op === 'auth') {
                        console.log('Bybit: Auth successful')

                        this._authSuccess = true;

                        this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['order']}))
                        this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['position']}))
                        this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['execution']}))
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
                } else if (data.data && data.topic && data.topic.toLowerCase() === 'order') {
                    const orders = data.data;
                    console.log("orders");
                    console.log(orders);
                } else if (data.data && data.topic && data.topic.toLowerCase() === 'position') {
                    const positionsRaw = data.data;
                    
                    console.log("position");
                    console.log(positionsRaw)
                    
                    // let positions = []
                    // positionsRaw.forEach(positionRaw => {
                    //     if (!['buy', 'sell'].includes(positionRaw['side'].toLowerCase())) {
                    //         delete me.positions[positionRaw.symbol]
                    //     } else {
                    //         positions.push(positionRaw)
                    //     }
                    // })

                    // Bybit.createPositionsWithOpenStateOnly(positions).forEach(position => {
                    //     me.positions[position.symbol] = position
                    // })
                } else {
                    console.log('unknown', data.data);
                }
            }
        };

        this.webSocket.onclose = () => {
            console.log('Bybit: Connection closed.')

            this._isLive = false;

            // retry connecting after some second to not bothering on high load
            setTimeout(() => {
                this.start(resolutionSet);
            }, 500);
        };

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

        const endpoint = `https://api2.bybit.com/kline/list?symbol=BTCUSD&resolution=${res[0]}&from=${from}&to=${to}`;

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
            return Promise.reject({})
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