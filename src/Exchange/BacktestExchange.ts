import { Exchange } from "Model/Exchange/Exchange";
import { Candle, Resolution } from "Model/Contracts";

export class BacktestExchange<T extends Exchange> extends Exchange {
    public getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]> {
        throw new Error("Method not implemented.");
    }

}