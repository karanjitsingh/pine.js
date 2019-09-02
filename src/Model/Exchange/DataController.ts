import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { SimpleSeries, RawSeries, Series } from "Model/Data/Series";
import { Candle } from "Model/Contracts";
import { MarketData, Tick, Resolution, ResolutionMapped } from "Model/Data/Data";

export interface TickUpdate {
    updatedResolutions: Resolution[],
    lastTick: number,
    currentTick: number
}

export class DataController extends Subscribable<number> {

    public readonly MarketDataMap: ResolutionMapped<MarketData> = {};

    public constructor(private exchange: Exchange, private resolutionSet: Resolution[]) {
        super();

        resolutionSet.forEach(res => {
            this.MarketDataMap[res] = this.createMarketDataSeries();
        });
    }

    public startStream() {
        this.getBaseData().then((dataMap) => {
            this.updateData(dataMap);
            // this.exchange.subscribe
            this.exchange.start(this.resolutionSet);
        })
    }

    private getBaseData(): Promise<ResolutionMapped<Candle[]>> {
        const resolutionDataMap: ResolutionMapped<Candle[]> = {};
        const currentTick = new Date().getTime();

        const promiseList: Promise<Candle[]>[] = [];

        this.resolutionSet.forEach(res => {
            const promise = this.exchange.getData(currentTick, Tick.Day, res);
            promise.then((candleData: Candle[]) => {
                resolutionDataMap[res] = candleData
            }, () => {
                
            }).catch(() => {
                
            })

            promiseList.push(promise);
        });

        return new Promise((resolve) => {
            Promise.all(promiseList).then(() => {
                resolve(resolutionDataMap);
            }, () => {
                
            });
        });
    }

    // private onDataStream(data: StreamData) {
    //     // fault check and update series;
    // }

    private updateData(resolutionDataMap: ResolutionMapped<Candle[]>) {
        // check for offsets and update data

        // const resolutions = Object.keys(resolutionDataMap);
        // let lastTick: number = 0;

        // if(resolutions.length) {
        
        //     resolutions.forEach((res) => {
        //         const update = resolutionDataMap[res];
        //         this.MarketDataMap[res].Candles.updateData(update.offset, update.candles);

        //         const tick = update.candles[update.candles.length - 1].startTick;

        //         lastTick = tick > lastTick ? tick : lastTick;
        //     });

        //     this.notifyAll(lastTick);
        // }
    }

    private createMarketDataSeries(): MarketData {
        const series = new RawSeries<Candle>([]);

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