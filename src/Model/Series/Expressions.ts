import { EvaluatedSeries, Series, SeriesData } from "Model/Series/Series";

export const Expression = (expr: (...args: SeriesData<number>[]) => number, ...deps: Series<any>[]): EvaluatedSeries<number> => {
    return new EvaluatedSeries(expr, deps);
}

export const Min = (s: Series<number> | SeriesData<number>, length: number) => {
    if(s instanceof Series) {
        s = s.lookBack(0);
    }

    let min = s(0);

    for(let i = 1; i <= length; i++) {
        if(min > s(i)) {
            min = s(i);
        }
    }

    return min;
}

export const Max = (s: Series<number> | SeriesData<number>, length: number) => {
    if(s instanceof Series) {
        s = s.lookBack(0);
    }

    let max = s(0);

    for(let i = 1; i <= length; i++) {
        if(max < s(i)) {
            max = s(i);
        }
    }

    return max;
}
export const Stoch =  (close: Series<any>, high: Series<any>, low: Series<any>, length: number) => {
    return Expression((close, high, low) => {
        const min = Min(low, length);
        // return (close(0)  - min)/(Max(high, length) - min)
        return close(0) - high(1);
    }, close, high, low);
}
