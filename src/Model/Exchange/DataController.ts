import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { SimpleSeries, RawSeries, Series, EvaluatedSeries } from "Model/Data/Series";
import { Candle } from "Model/Contracts";
import { MarketData, Tick, Resolution, ResolutionMapped, GetResolutionTick } from "Model/Data/Data";
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
                this.fetchUpdate();
            });
        })
    }

    private fetchUpdate() {
        const data = this.dataQueue.flush();
        
        if(data.length > 0) {
            this.updateData(data);
        }

        if(this.isRunning) {
            setTimeout(this.fetchUpdate.bind(this), 1);
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

    private updateData(fetchedUpdated: ResolutionMapped<Candle>[]) {
        this.resolutionSet.forEach(resolution => {
            const update = fetchedUpdated.reduce<Candle[]>((candles, curr) => {
                const currCandle = curr[resolution];
                
                if(candles.length == 0) {
                    candles.push(currCandle);
                } else {
                    const last = candles.length - 1;

                    if(candles[last].startTick == currCandle.startTick) {
                        candles[last] = currCandle;
                    } else if (candles[last].startTick < currCandle.startTick) {
                        candles.push(currCandle);
                    } else {
                        throw new Error("Backfill error.");
                    }
                }

                return candles;
            }, []);
            
            const marketCandles = this.MarketDataMap[resolution].Candles;

            const lastCandle = marketCandles.getData(1)[0];

            if(!lastCandle) {
                marketCandles.updateData(0, update);
            } else if (lastCandle.startTick == update[0].startTick) {
                marketCandles.updateData(1, update);
            } else if (lastCandle.startTick + GetResolutionTick(resolution) == update[0].startTick) {
                marketCandles.updateData(0, update);
            } else {
                throw new Error("Backfill error.")
            }
        });

        // how to issue what updates went in; and how to issue the new updates to the reporter
        EvaluatedSeries.evaluteUpdates()
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