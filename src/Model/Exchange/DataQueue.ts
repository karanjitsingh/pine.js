import { Candle, Resolution, ResolutionMapped } from "Model/Contracts";

export class DataQueue {
    private updateQueue: ResolutionMapped<Candle>[] = [];
    private lastUpdate: ResolutionMapped<Candle> = {};
    
    public constructor(private resolutionSet: Resolution[]) {}

    public push(res: Resolution, candle: Candle) {
        this.lastUpdate[res] = candle;

        if(Object.keys(this.lastUpdate).length == this.resolutionSet.length) {
            this.updateQueue.push(this.lastUpdate);
            this.lastUpdate = {};
        }
    }

    public flush(): ResolutionMapped<Candle>[] {
        if (this.updateQueue.length > 0) {
            return this.updateQueue.splice(0, this.updateQueue.length);
        }

        return [];
    }

    public reset() {
        this.updateQueue = [];
    }
}