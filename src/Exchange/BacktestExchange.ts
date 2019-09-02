import { Exchange } from "Model/Exchange/Exchange";
import { Candle } from "Model/Contracts";
import { Resolution } from "Model/Data/Data";

export class BacktestExchange<T extends Exchange> extends Exchange {
    public start(resolutionSet: Resolution[]) {
        throw new Error("Method not implemented.");
    }
    public isLive(): boolean {
        throw new Error("Method not implemented.");
    }
    public getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]> {
        throw new Error("Method not implemented.");
    }

}