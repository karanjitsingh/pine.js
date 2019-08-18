import { RawSeries, Series } from "./Series";
import { Candle } from "./Data";

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
    Data: RawSeries<Candle>;
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