import { Candle } from "Model/Contracts";
import { MarketData } from "Model/InternalContracts";
import { EvaluatedSeries, ISeries, SeriesData, SimpleSeries } from "Model/Series/Series";

export const Expression = <T = number>(expr: (self: SeriesData<T>, ...args: SeriesData<T>[]) => T, ...deps: ISeries<T>[]): ISeries<T> => {
    return new EvaluatedSeries<T>(expr, deps);
}

export const Min = (s: SeriesData, length: number) => {
    let min = s(0);

    for (let i = 1; i <= length; i++) {
        if (min > s(i)) {
            min = s(i);
        }
    }

    return min;
}

export const Max = (s: SeriesData, length: number) => {
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
        return (close(0)  - min)/(Max(high, length) - min)*100
    }, close, high, low);
}

export const HeikinAshi = (candleSeries: ISeries<Candle>): MarketData => {
    const series = Expression((self, candle) => {
        const candle0 = candle(0);
        const ha1 = self(1);

        let haclose = (candle0.Close + candle0.Open + candle0.Low + candle0.High)/4;
        let haopen: number;
        let hahigh: number;
        let halow: number;

        if(!ha1) {
            haopen = (candle0.Open + candle0.Close)/2;
            halow = candle0.Low;
            haopen = candle0.Open;
        } else {
            haopen = (ha1.Open + ha1.Close)/2;
            hahigh = Math.max(candle0.High, haopen, haclose);
            halow = Math.min(candle0.Low, haopen, haclose);
        }

        return {
            Close: haclose,
            Open: haopen,
            High: hahigh,
            Low: halow,
            Volume: candle0.Volume,
            StartTick: candle0.StartTick,
            EndTick: candle0.EndTick
        }

    }, candleSeries);
    
    return {
        Candles: series,
        Open: new SimpleSeries(series, (candle: Candle) => candle.Open),
        Close: new SimpleSeries(series, (candle: Candle) => candle.Close),
        High: new SimpleSeries(series, (candle: Candle) => candle.High),
        Low: new SimpleSeries(series, (candle: Candle) => candle.Low),
        Volume: new SimpleSeries(series, (candle: Candle) => candle.Volume),
    }
}

export const ema = (series: ISeries, length: number) => {
    const alpha = 2 / (1 + length);

    return Expression((self, series) => {
        const prev = self(1);
        return alpha * series(0) + (1 - alpha) * (prev ? prev : 0);
    }, series)
}

export const sma = (series: ISeries, length: number) => {
    return Expression((self, series) => {
        if(!series(length-1)) {
            return undefined;
        }

        if(!self(1)) {
            let sum = 0;

            for(let i = 0; i < length; i++) {
                sum += series(i);
            }

            return sum/length;
        } else {
            return self(1) - (series(length) / length) + series(0)/length
        }
    }, series);
}
