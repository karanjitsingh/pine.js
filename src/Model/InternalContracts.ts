import { Candle, Resolution } from "./Contracts";
import { RawSeries, SimpleSeries } from "./Series/Series";

export interface MarketData {
    Candles: RawSeries<Candle>;
    Open: SimpleSeries;
    Close: SimpleSeries;
    High: SimpleSeries;
    Low: SimpleSeries;
    Volume: SimpleSeries;
}

export enum Tick
{
    Second = 1000,
    Minute = Second * 60,
    Hour = Minute * 60,
    Day = Hour * 24,
    Week = Day * 7
}

export const GetResolutionTick = (resolution: Resolution): number => {
    const match = resolution.match(/^([0-9]+)(.)$/);
    if(!match) {
        throw new Error(`Invalid resolution '${resolution}'`);
    }

    const quantum = parseInt(match[1]);

    switch(match[2]) {
        case "m":
            return Tick.Minute * quantum;
        case "d":
            return Tick.Day * quantum;
        case "w":
            return Tick.Week * quantum;
        default:
            throw new Error(`Unsupported resolution '${resolution}'`);
    }
}

export enum Position {
    Long,
    Short
}

export interface OpenTrade {
    entry: number,
    leverage: number,
    orderValue: number,
    position: Position
}