import { Candle, Glyph } from "./Contracts";
import { ISeries } from "./Series/Series";

export interface MarketData {
    Candles: ISeries<Candle>;
    Open: ISeries;
    Close: ISeries;
    High: ISeries;
    Low: ISeries;
    Volume: ISeries;
}

export enum Tick
{
    Second = 1000,
    Minute = Second * 60,
    Hour = Minute * 60,
    Day = Hour * 24,
    Week = Day * 7
}

export interface IReportingInterface {
    logMessage(message: string): void;
    logGlyph(glyph: Glyph): void;
}
