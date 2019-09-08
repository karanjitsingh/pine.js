import { Candle, Resolution, ResolutionMapped, Dictionary } from "Model/Contracts";
import { GetResolutionTick, MarketData, Tick } from "Model/Data/Data";
import { RawSeries, SimpleSeries, EvaluatedSeries, UpdateIndex } from "Model/Data/Series";
import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { DataQueue } from "./DataQueue";

export interface TickUpdate {
    updatedResolutions: Resolution[],
    lastTick: number,
    currentTick: number
}


export class DataController extends Subscribable<ResolutionMapped<number>> {

    public readonly MarketDataMap: ResolutionMapped<MarketData> = {};
    private dataQueue: DataQueue;
    private isRunning: boolean = false;

    public constructor(private exchange: Exchange, private resolutionSet: Resolution[]) {
        super();

        resolutionSet.forEach(res => {
            this.MarketDataMap[res] = this.createMarketDataSeries(res);
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
        const resolutions = Object.keys(resolutionDataMap);
        
        const updateIndex: ResolutionMapped<UpdateIndex> = {};
        const lengthMap: ResolutionMapped<number> = {};

        if(resolutions.length) {
            resolutions.forEach((res: Resolution) => {
                const update = resolutionDataMap[res];
                this.MarketDataMap[res].Candles.append(update);

                updateIndex[res] = {
                    offset: 0,
                    length: update.length
                }

                lengthMap[res] = update.length
            });
        }

        EvaluatedSeries.evaluteUpdates(updateIndex);
        this.notifyAll(lengthMap);
    }

    private updateData(fetchedUpdated: ResolutionMapped<Candle>[]) {

        const updateIndex: ResolutionMapped<UpdateIndex> = {};
        const lengthMap: ResolutionMapped<number> = {};

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

            lengthMap[resolution] = update.length;

            if(!lastCandle) {

                marketCandles.updateData(0, update);

                updateIndex[resolution] = {
                    offset: 0,
                    length: update.length
                }

            } else if (lastCandle.startTick == update[0].startTick) {
                
                marketCandles.updateData(1, update);
        
                updateIndex[resolution] = {
                    offset: 1,
                    length: update.length
                }

            } else if (lastCandle.startTick + GetResolutionTick(resolution) == update[0].startTick) {
                
                marketCandles.updateData(0, update);
            
                updateIndex[resolution] = {
                    offset: 0,
                    length: update.length
                }
            
            } else {
                throw new Error("Backfill error.")
            }
        });

        EvaluatedSeries.evaluteUpdates(updateIndex);
        this.notifyAll(lengthMap);
    }

    private createMarketDataSeries(resolution: Resolution): MarketData {
        const series = new RawSeries<Candle>([], resolution);

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