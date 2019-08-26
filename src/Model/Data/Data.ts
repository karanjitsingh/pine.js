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