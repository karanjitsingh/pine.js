import { RawSeries, Series } from "./Series";
import { Candle, Resolution } from "./Data";

export interface Trade {
    EntryTick: number;
    ExitTick: number;
    EntryPrice: number;
    ExitPrice: number;
    ProfitLoss: number;
    FeePaid: number;
    NetAccountValue: number;
    FillType: string;
}

export interface Plot {
    Resolution: Resolution;
    Indicators: Series<number>[];
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