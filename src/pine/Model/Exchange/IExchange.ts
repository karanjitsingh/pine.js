import { IBroker } from "./IBroker";
import { Candle, Resolution } from "../Data/Data";
import { DataStream } from "./DataStream";

export interface IExchange {
    readonly Broker: IBroker;
    readonly DataStream: DataStream;
    getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]>;
}