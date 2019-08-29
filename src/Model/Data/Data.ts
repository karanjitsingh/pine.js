import { Candle } from "Model/Contracts";
import { RawSeries, SimpleSeries } from "./Series";

export interface MarketData {
    Candles: RawSeries<Candle>;
    Open: SimpleSeries;
    Close: SimpleSeries;
    High: SimpleSeries;
    Low: SimpleSeries;
    Volume: SimpleSeries;
}

export type MarketDataMap = {[resolution: string]: MarketData}; 

export enum Resolution {
    _1m = "1m",
    _3m = "3m",
    _5m = "5m",
    _15m = "15m",
    _30m = "30m",
    _1h = "1h",
    _2h = "2h",
    _4h = "4h",
    _12h = "12h",
    _d = "d"
}

export enum Tick
{
    Second = 1000,
    Minute = Second * 60,
    Hour = Minute * 60,
    Day = Hour * 24
}