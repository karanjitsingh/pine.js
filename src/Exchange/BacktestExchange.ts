import { Candle, Resolution } from "Model/Contracts";
import { DataQueue } from "Model/Exchange/DataQueue";
import { Exchange } from "Model/Exchange/Exchange";

export class BacktestExchange<T extends Exchange> extends Exchange {
    public start(resolutionSet: Resolution[]): Promise<DataQueue> {
        throw new Error("Method not implemented.");
    }
    public isLive(): boolean {
        throw new Error("Method not implemented.");
    }
    public getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]> {
        throw new Error("Method not implemented.");
    }

}