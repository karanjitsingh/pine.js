import { Candle } from "Model/Contracts";
import { Resolution } from "Model/Data/Data";

export class DataQueue {

    private messageQueue: [Resolution, Candle][] = [];

    public push(res: Resolution, candle: Candle) {
        this.messageQueue.push([res, candle]);
    }

    public flush(): [Resolution, Candle][] {
        if (this.messageQueue.length > 0) {
            return this.messageQueue.splice(0, this.messageQueue.length);
        }

        return [];
    }

    public reset() {
        this.messageQueue = [];
    }
}