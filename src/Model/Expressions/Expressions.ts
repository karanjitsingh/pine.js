import { SeriesData, Series, EvaluatedSeries } from "Model/Data/Series";

export const Expression = (expr: (...args: SeriesData<number>[]) => number, ...args: Series<any>[]): EvaluatedSeries<number> => {
    const minlength = Math.min(...args.map(x => x.getLength()));

    var data: number[] = new Array(minlength);

    for(let i =0; i < minlength; i++) {
        data.push(expr(...args.map(x => x.lookBack(minlength - 1 - i))));
    }

    return new EvaluatedSeries(data, expr, args);
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
