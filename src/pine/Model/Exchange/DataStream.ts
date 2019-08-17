import { Resolution, Candle } from "../Data/Data";
import { SimpleSeries, RawSeries } from "../Data/Series";
import { Subscribable } from "../Events";

export interface MarketData {
    Open: SimpleSeries,
    Close: SimpleSeries,
    High: SimpleSeries,
    Low: SimpleSeries,
    Volume: SimpleSeries
}

export class DataStream extends Subscribable<number> {

    public constructor(private resolutionCandleMap: {[resolution: string]: RawSeries<Candle>}) {
        super();
    }

    public update(currentCandle: Candle, previousCandle: Candle) {
        // update raw series
        const tick = 0;

        this.notifyAll(tick);
    }
}