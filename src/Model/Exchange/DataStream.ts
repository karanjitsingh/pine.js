import { Candle } from "Model/Contracts";
import { Subscribable } from "Model/Events";
import { Resolution } from "Model/Data/Data";

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