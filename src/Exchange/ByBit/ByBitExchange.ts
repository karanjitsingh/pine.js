import { INetwork } from "Model/Network";
import { IBroker } from "Model/Exchange/IBroker";
import { Exchange } from "Model/Exchange/Exchange";
import { Candle } from "Model/Contracts";
import { Tick, Resolution } from "Model/Data/Data";
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
    
    private readonly LiveSupportedResolutions: string[] = Object.keys(Resolution);
    private _isLive: boolean = false;;
    private webSocket: WebSocket;
    
    constructor(protected network: INetwork, private broker: IBroker) {
        super(network, broker);
    }

    public isLive(): boolean {
        return this._isLive;
    }

    public start(resolutionSet: Resolution[]) {
        const unsupportedResolutions = resolutionSet.filter(val => !this.LiveSupportedResolutions.includes(val));

        if(unsupportedResolutions.length > 0) {
            throw new Error("Unsupported resolution(s): " + JSON.stringify(unsupportedResolutions));
        }

        
        this.webSocket = new WebSocket('wss://stream.bybit.com/realtime');
        
        this.webSocket.onopen = () => {
            const symbol = "BTCUSD";
            console.log('Bybit: Connection opened');
            
            this.webSocket.send(JSON.stringify({'op': 'subscribe', 'args': ['kline.' + symbol + '.' + resolutionSet.join('|')]}));
            
            this._isLive = true;
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
                    let candle = data.data

                    // let candleStick = new ExchangeCandlestick(
                    //     me.getName(),
                    //     candle['symbol'],
                    //     candle['interval'],
                    //     candle['open_time'],
                    //     candle['open'],
                    //     candle['high'],
                    //     candle['low'],
                    //     candle['close'],
                    //     candle['volume'],
                    // )

                    // await me.candleImporter.insertThrottledCandles([candleStick])
                    // update data controller
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
        switch (resolution) {
            case Resolution.$1m:
                return ["1", Tick.Minute * 1];
            case Resolution.$3m:
                return ["3", Tick.Minute * 3];
            case Resolution.$5m:
                return ["5", Tick.Minute * 5];
            case Resolution.$15m:
                return ["15", Tick.Minute * 15];
            case Resolution.$30m:
                return ["30", Tick.Minute * 30];
            case Resolution.$1h:
                return ["60", Tick.Minute * 60];
            case Resolution.$2h:
                return ["120", Tick.Minute * 120];
            case Resolution.$4h:
                return ["240", Tick.Minute * 240];
            case Resolution.$12h:
                return ["720", Tick.Minute * 720];
            case Resolution.$1d:
                return ["D", Tick.Day];
            default:
                throw new Error("Unsupported resolution for getting base data");
        }
    }
}