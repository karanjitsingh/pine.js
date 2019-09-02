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

export type ResolutionMapped<T> = {[resolution: string]: T}; 


export enum Resolution {
    $1m = "1m",
    $3m = "3m",
    $5m = "5m",
    $15m = "15m",
    $30m = "30m",
    $1h = "1h",
    $2h = "2h",
    $3h = "3h",
    $4h = "4h",
    $6h = "6h",
    $12h = "12h",
    $1d = "1d",
    $3d = "3d",
    $1w = "1w",
    $2w = "2w",
    $1M = "1M",
}

export enum Tick
{
    Second = 1000,
    Minute = Second * 60,
    Hour = Minute * 60,
    Day = Hour * 24
}