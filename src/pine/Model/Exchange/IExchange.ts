import { IBroker } from "Model/Exchange/IBroker";
import { Resolution, Candle } from "Model/Data/Data";
import { DataStream } from "Model/Exchange/DataStream";

export interface IExchange {
    readonly Broker: IBroker;
    readonly DataStream: DataStream;
    getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]>;
}