import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { SimpleSeries, RawSeries, Series } from "Model/Data/Series";
import { StreamData } from "./DataStream";
import { Resolution, Candle, Tick } from "Model/Data/Data";

export interface MarketData {
    Candles: RawSeries<Candle>;
    Open: SimpleSeries,
    Close: SimpleSeries,
    High: SimpleSeries,
    Low: SimpleSeries,
    Volume: SimpleSeries
}

export interface TickUpdate {
    updatedResolutions: Resolution[],
    lastTick: number,
    currentTick: number
}

export class DataController extends Subscribable<number> {

    public constructor(private exchange: Exchange, private resolutionSet: Resolution[]) {
        super();

        exchange.DataStream.subscribe(this.onDataStream, this);
    }

    public getBaseData(): Promise<{ [resolution: string]: MarketData }> {
        const data: { [resolution: string]: MarketData } = {};
        const currentTick = new Date().getTime();

        const promiseList: Promise<Candle[]>[] = [];

        this.resolutionSet.forEach(res => {
            const promise = this.exchange.getData(currentTick - Tick.Day, currentTick, res);
            promise.then((data: Candle[]) => {
                data[res] = this.getMarketData(data);
            })

            promiseList.push(promise);
        });

        return new Promise((resolve) => {
            Promise.all(promiseList).then(() => { resolve(data); });
        });
    }

    private onDataStream(data: StreamData) {
        // fault check and update series;
    }

    private getMarketData(data: Candle[]): MarketData {
        const series = new RawSeries<Candle>(data);

        return {
            Candles: series,
            Open: new SimpleSeries(series, (candle: Candle) => candle.open),
            Close: new SimpleSeries(series, (candle: Candle) => candle.close),
            High: new SimpleSeries(series, (candle: Candle) => candle.high),
            Low: new SimpleSeries(series, (candle: Candle) => candle.low),
            Volume: new SimpleSeries(series, (candle: Candle) => candle.volume),
        }
    }
}