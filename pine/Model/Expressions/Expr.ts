import { Series, SeriesData } from "../Series";

export const Expression = (expression: (...args: SeriesData[]) => number, ...args: Series[]): Series => {
    const minlength = Math.min(...args.map(x => x.data.length));

    var data = new Array(minlength);

    for(let i =0; i < minlength; i++) {
        data.push(expression(...args.map(x => x.lookBack(minlength - 1 - i))));
    }

    return Series.Create(data);
}

export const Min = (s: Series | SeriesData, length: number) => {
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

export const Max = (s: Series | SeriesData, length: number) => {
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
export const Stoch =  (close: Series, high: Series, low: Series, length: number) => {
    return Expression((close, high, low) => {
        const min = Min(low, length);
        // return (close(0)  - min)/(Max(high, length) - min)
        return close(0) - high(1);
    }, close, high, low);
}