import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { SimpleSeries, RawSeries, Series } from "Model/Data/Series";
import { Candle } from "Model/Contracts";
import { MarketData, Tick, Resolution, ResolutionMapped } from "Model/Data/Data";
import { DataQueue } from "./DataQueue";

export interface TickUpdate {
    updatedResolutions: Resolution[],
    lastTick: number,
    currentTick: number
}

export class DataController extends Subscribable<number> {

    public readonly MarketDataMap: ResolutionMapped<MarketData> = {};
    private dataQueue: DataQueue;
    private isRunning: boolean = false;

    public constructor(private exchange: Exchange, private resolutionSet: Resolution[]) {
        super();

        resolutionSet.forEach(res => {
            this.MarketDataMap[res] = this.createMarketDataSeries();
        });
    }

    public startStream() {
        this.getBaseData().then((dataMap) => {
            this.initData(dataMap);

            this.exchange.start(this.resolutionSet).then((queue: DataQueue) => {
                this.dataQueue = queue;
                this.isRunning = true;
                this.update();
            });
        })
    }

    private update() {
        const data = this.dataQueue.flush();
        
        if(data.length > 0) {
            console.log(JSON.stringify(data), "asdf");
        }

        if(this.isRunning) {
            setTimeout(this.update.bind(this), 1);
        }
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
                // todo handle rejections
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

    private initData(resolutionDataMap: ResolutionMapped<Candle[]>) {
        console.log(resolutionDataMap);

        const resolutions = Object.keys(resolutionDataMap);

        if(resolutions.length) {
            resolutions.forEach((res) => {
                const update = resolutionDataMap[res];
                this.MarketDataMap[res].Candles.append(update);
            });
        }
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