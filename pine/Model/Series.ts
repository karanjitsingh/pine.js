export type SeriesData = (lookback: number) => number | number;

export class Series<T> {
    public data: T[];

    public static Create<T>(data: T[], resolver?: (data: T) => number): Series<T> {
        const clone = data.slice(0);
        return new Series<T>(clone, resolver);
    }

    private constructor(data: T[], private resolver: (data: T) => number, private seriesOffset?: number) {
        this.seriesOffset = this.seriesOffset ? this.seriesOffset : 0;
        this.data = data;
    }

    public prepend(array: T[]) {
        const clone = array.slice(0);
        this.data = clone.concat(this.data);
    }

    public append(array: T[]) {
        const clone = array.slice(0);
        this.data = this.data.concat(clone);
    }

    public lookBack(offset: number): SeriesData {
        return (x: number) => {
            const index = this.data.length - 1 - x - this.seriesOffset - offset;
            if(index >= 0) {
                return 
            }
            else {
                return undefined;
            }
        }
    }

    public offset(offset: number): Series<T> {
        return new Series(this.data, this.resolver, offset);
    }

    private resolve(data: T) {
        if(!(data instanceof Number)) {
            return this.resolver(data);
        }
    }
}
