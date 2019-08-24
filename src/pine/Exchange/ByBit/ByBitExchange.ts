import { INetwork } from "../../Model/Platform/Network";
import { Resolution, Candle, Tick } from "../../Model/Data/Data";
import { DataStream } from "../../Model/Exchange/DataStream";
import { IBroker } from "../../Model/Exchange/IBroker";
import { Exchange } from "Model/Exchange/Exchange";

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
    public readonly DataStream: DataStream;

    constructor(protected network: INetwork, private broker: IBroker) {
        super(network, broker);
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
            case Resolution._12h:
                return ["720", Tick.Minute * 720];
            case Resolution._d:
                return ["D", Tick.Day];
            default:
                throw new Error("Resolution not defined");
        }
    }
}