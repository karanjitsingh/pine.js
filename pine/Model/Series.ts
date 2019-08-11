export type SeriesData = (lookback: number) => number | number;

export class Series {
    public data: number[];

    private seriesOffset: number;

    public prepend(array: number[]) {
        const clone = array.slice(0);
        this.data = clone.concat(this.data);
    }

    public append(array: number[]) {
        const clone = array.slice(0);
        this.data = this.data.concat(clone);
    }

    public lookBack(offset: number): SeriesData {
        return (x: number) => {
            const index = this.data.length - 1 - x - this.seriesOffset - offset;
            if(index >= 0) {
                return this.data[index]
            }
            else {
                return undefined;
            }
        }
    }

    public offset(offset: number): Series {
        return new Series(this.data, offset);
    }

    private constructor(data: number[], offset?: number) {
        this.seriesOffset = offset ? offset : 0;
        this.data = data;
    }

    public value(x: (x: number) => number) {

    }

    public static Create(data: number[]): Series {
        const clone = data.slice(0);
        return new Series(clone);
    }

}
