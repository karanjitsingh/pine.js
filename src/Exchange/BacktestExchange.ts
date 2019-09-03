import { Exchange } from "Model/Exchange/Exchange";
import { Candle } from "Model/Contracts";
import { Resolution } from "Model/Data/Data";
import { DataQueue } from "Model/Exchange/DataQueue";

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