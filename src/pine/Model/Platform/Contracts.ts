import { Candle, Resolution } from "Model/Data/Data";
import { SimpleSeries, RawSeries } from "Model/Data/Series";

export enum PlotType {
    Area,
    Line
}

export interface ChartIndicator {
    PlotType: PlotType,
    Data: number[]
}

export interface ChartData {
    Data: Array<Candle>;
    Name: string;
    Resolution: Resolution;
    Indicators: ChartIndicator[];
}

export interface MarketData {
    Candles: RawSeries<Candle>;
    Open: SimpleSeries;
    Close: SimpleSeries;
    High: SimpleSeries;
    Low: SimpleSeries;
    Volume: SimpleSeries;
}

export type MarketDataMap = {[resolution: string]: MarketData}; 