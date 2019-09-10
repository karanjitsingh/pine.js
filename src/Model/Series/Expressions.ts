import { Candle } from "Model/Contracts";
import { MarketData } from "Model/InternalContracts";
import { EvaluatedSeries, ISeries, SeriesData, SimpleSeries } from "Model/Series/Series";

export const Expression = <T = number>(expr: (self: SeriesData<T>, ...args: SeriesData<T>[]) => T, ...deps: ISeries<T>[]): ISeries<T> => {
    return new EvaluatedSeries<T>(expr, deps);
}

export const Min = (s: ISeries | SeriesData, length: number) => {
    if (s instanceof Object) {
        s = (s as ISeries).lookBack(0);
    }

    let min = s(0);

    for (let i = 1; i <= length; i++) {
        if (min > s(i)) {
            min = s(i);
        }
    }

    return min;
}

export const Max = (s: ISeries | SeriesData, length: number) => {
    if (s instanceof Object) {
        s = (s as ISeries).lookBack(0);
    }

    let max = s(0);

    for (let i = 1; i <= length; i++) {
        if (max < s(i)) {
            max = s(i);
        }
    }

    return max;
}

export const Stoch = (close: ISeries, high: ISeries, low: ISeries, length: number): ISeries => {
    return Expression((_, close, high, low) => {
        const min = Min(low, length);
        return (close(0)  - min)/(Max(high, length) - min)
    }, close, high, low);
}

export const HeikinAshi = (candleSeries: ISeries<Candle>): MarketData => {
    const series = Expression((self, candle) => {
        const candle0 = candle(0);
        const ha1 = self(1);

        let haclose = (candle0.close + candle0.open + candle0.low + candle0.high)/4;
        let haopen: number;
        let hahigh: number;
        let halow: number;

        if(!ha1) {
            haopen = (candle0.open + candle0.close)/2;
            halow = candle0.low;
            haopen = candle0.open;
        } else {
            haopen = (ha1.open + ha1.close)/2;
            hahigh = Math.max(candle0.high, haopen, haclose);
            halow = Math.min(candle0.low, haopen, haclose);
        }

        return {
            close: haclose,
            open: haopen,
            high: hahigh,
            low: halow,
            volume: candle0.volume,
            startTick: candle0.startTick,
            endTick: candle0.endTick
        }

    }, candleSeries);
    
    return {
        Candles: series,
        Open: new SimpleSeries(series, (candle: Candle) => candle.open),
        Close: new SimpleSeries(series, (candle: Candle) => candle.close),
        High: new SimpleSeries(series, (candle: Candle) => candle.high),
        Low: new SimpleSeries(series, (candle: Candle) => candle.low),
        Volume: new SimpleSeries(series, (candle: Candle) => candle.volume),
    }
}

export const ema = (series: ISeries, length: number) => {
    const alpha = 2 / (1 + length);

    return Expression((self, series) => {
        const prev = self(1);
        return alpha * series(0) + (1 - alpha) * (prev ? prev : 0);
    }, series)
}