import { Resolution, Candle } from "../Data/Data";
import { SimpleSeries, RawSeries } from "../Data/Series";
import { Subscribable } from "../Events";


export interface StreamData {
    Candle: Candle;
    Resolution: Resolution;
}

export class DataStream extends Subscribable<StreamData> {

    public constructor() {
        super();
    }

    public update(data: StreamData) {
        this.notifyAll(data);
    }
}