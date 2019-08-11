import { IExchange, Resolution, Candle } from "./IExchange";
import { NetworkFactory, INetwork } from "../Network/Network";
import { Tick } from "../Model/Tick";

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

export class ByBitExchange implements IExchange {
    private network: INetwork;

    constructor() {
        this.network = NetworkFactory.getInstance();
    }

    public async getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]> {
        console.log("ByBit", "getData", startTime, endTime, resolution);

        const res = this.resolutionMap(resolution);

        if(res == null) {
            console.error("Unsupported resolution:", res[0]);
            return Promise.reject("Unsupported resolution");
        }

        const endpoint = `https://api2.bybit.com/kline/list?symbol=BTCUSD&resolution=${res}&from=${startTime}to=${endTime}`;

        const data = await this.network.get(endpoint) as SymbolResponse;

        Promise.resolve(data.result.map((result: CandleResult): Candle => {
            const startTick = result.start_at;

            return {
                startTick,
                endTick: startTick + res[1],
                high: result.high,
                open: result.open,
                close: result.close,
                low: result.low,
                volume: result.volume
            } as Candle;
        }));
    }

    public subscribe(handle: (candle: Candle) => void) {

    }

    private resolutionMap(resolution: Resolution): [string, number] {
        switch (resolution) {
            case Resolution._1m:
                return ["1", Tick.Minute * 1];
            case Resolution._3m:
                return ["3", Tick.Minute * 3];
            case Resolution._5m:
                return ["5", Tick.Minute * 5];
            case Resolution._15m:
                return ["15", Tick.Minute * 15];
            case Resolution._30m:
                return ["30", Tick.Minute * 30];
            case Resolution._1h:
                return ["60", Tick.Minute * 60];
            case Resolution._2h:
                return ["120", Tick.Minute * 120];
            case Resolution._4h:
                return ["240", Tick.Minute * 240];
            case Resolution._d:
                return ["D", Tick.Day];
            default:
                return null;
        }
    }
}
