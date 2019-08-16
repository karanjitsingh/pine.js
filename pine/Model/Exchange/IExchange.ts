import { IBroker } from "./IBroker";
import { Candle, Resolution } from "../Data/Data";

export interface IExchange {
    readonly Broker: IBroker;
    getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]>;
    subscribe(handle: (candle: Candle) => void); 
}