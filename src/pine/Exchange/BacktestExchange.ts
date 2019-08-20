import { Exchange } from "Model/Exchange/Exchange";

export class BacktestExchange<T extends Exchange> extends Exchange {
    public getData(startTime: number, endTime: number, resolution: import("../Model/Data/Data").Resolution): Promise<import("../Model/Data/Data").Candle[]> {
        throw new Error("Method not implemented.");
    }

}