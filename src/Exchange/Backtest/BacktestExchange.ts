import { Candle, Resolution } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { CandleQueue } from "Model/Utils/CandleQueue";

export class BacktestExchange<T extends Exchange> extends Exchange {
    public get isLive(): boolean {
        throw new Error("Method not implemented.");
    }

    public start(resolutionSet: Resolution[]): Promise<CandleQueue> {
        throw new Error("Method not implemented.");
    }

    public getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]> {
        throw new Error("Method not implemented.");
    }
}