import { Candle, Resolution } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { IBroker } from "Model/Exchange/IBroker";
import { GetResolutionTick, Tick } from "Model/InternalContracts";
import { INetwork } from "Model/Network";
import { CandleQueue } from "Model/Utils/CandleQueue";
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
    
    private _isLive: boolean = false;;
    private webSocket: WebSocket;
    
    constructor(protected network: INetwork, private broker: IBroker) {
        super(network, broker);
    }

    public get isLive(): boolean {
        return this._isLive;
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

        // this.subscribedResolutions = resolutionSet;
        this.subscribedResolutions = resolutionSet;
        
        this.webSocket = new WebSocket('wss://stream.bybit.com/realtime');
        
        this.webSocket.onopen = () => {
            const symbol = "BTCUSD";
            console.log('Bybit: Connection opened');
            
            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['kline.' + symbol + '.' + this.subscribedResolutions.join("|")]}));
            this.webSocket.send('{"op":"subscribe","args":["instrument.BTCUSD"]}')

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
                        // me.logger.info('Bybit: Auth successful')

                        // ws.send(JSON.stringify({'op': 'subscribe', 'args': ['order']}))
                        // ws.send(JSON.stringify({'op': 'subscribe', 'args': ['position']}))
                        // ws.send(JSON.stringify({'op': 'subscribe', 'args': ['execution']}))
                    }
                } else if (data.topic && data.topic.startsWith('kline.')) {
                    console.log(new Date().getTime(), "Bybit: websocket data")

                    const candle: Candle = {
                        startTick: data.data.open_time * 1000,
                        endTick: null,
                        high: data.data.high,
                        open: data.data.open,
                        close: data.data.close,
                        low: data.data.low,
                        volume: data.data.volume    
                    }

                    this.dataQueue.push(data.data.interval, candle);
                } else if (data.data && data.topic && data.topic.toLowerCase() === 'order') {
                    // let orders = data.data;

                    // Bybit.createOrders(orders).forEach(order => {
                    //     me.triggerOrder(order)
                    // })
                } else if (data.data && data.topic && data.topic.toLowerCase() === 'position') {
                    // let positionsRaw = data.data;
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
                    // console.log('unknown', data.data);
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
                        startTick: startTick * 1000,
                        endTick: (startTick + res[1]) * 1000,
                        high: result.high,
                        open: result.open,
                        close: result.close,
                        low: result.low,
                        volume: result.volume
                    } as Candle;
                });

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
        const tickValue = GetResolutionTick(resolution);
        
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