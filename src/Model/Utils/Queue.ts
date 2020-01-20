import { Candle, Resolution, ResolutionMapped } from "Model/Contracts";

export class Queue<T> {
    protected queue: T[] = [];

    public push(value: T) {
        this.queue.push(value);
    }

    public flush(): T[] {
        if (this.queue.length > 0) {
            return this.queue.splice(0, this.queue.length);
        }

        return [];
    }

    public reset() {
        this.queue = [];
    }
}

export class CandleQueue extends Queue<ResolutionMapped<Candle>> {
    private lastUpdate: ResolutionMapped<Candle> = {};

    constructor(private resolutionSet: Resolution[]) {
        super();
    }

    public push(candle: ResolutionMapped<Candle>) {
        Object.assign(this.lastUpdate, candle);

        if(Object.keys(this.lastUpdate).length == this.resolutionSet.length) {
            this.queue.push(this.lastUpdate);
            this.lastUpdate = {};
        }
    }
}