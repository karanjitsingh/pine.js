import { Candle, Resolution, ResolutionMapped } from "Model/Contracts";

export class UpdateQueue<T> {
    protected updateQueue: T[] = [];

    public push(value: T) {
        this.updateQueue.push(value);
    }

    public flush(): T[] {
        if (this.updateQueue.length > 0) {
            return this.updateQueue.splice(0, this.updateQueue.length);
        }

        return [];
    }

    public reset() {
        this.updateQueue = [];
    }
}

export class CandleQueue extends UpdateQueue<ResolutionMapped<Candle>> {
    private lastUpdate: ResolutionMapped<Candle> = {};

    constructor(private resolutionSet: Resolution[]) {
        super();
    }

    public push(candle: ResolutionMapped<Candle>) {
        Object.assign(this.lastUpdate, candle);

        if(Object.keys(this.lastUpdate).length == this.resolutionSet.length) {
            this.updateQueue.push(this.lastUpdate);
            this.lastUpdate = {};
        }
    }
}