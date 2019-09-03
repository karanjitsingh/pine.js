import { Candle } from "Model/Contracts";

export class DataQueue {

    private messageQueue: Candle[] = [];

    public push(candle: Candle) {
        this.messageQueue.push(candle);
        console.log(JSON.stringify(candle));
    }

    public flush(): Candle[] {
        if (this.messageQueue.length > 0) {
            return this.messageQueue.splice(0, this.messageQueue.length);
        }

        return [];
    }

    public reset() {
        this.messageQueue = [];
    }
}