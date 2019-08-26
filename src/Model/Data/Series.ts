import { Subscribable } from "Model/Events";

export type SeriesData<T> = (lookback: number) => T;

export abstract class Series<T> extends Subscribable<number> {
    
    protected constructor(protected data: T[]) {
        super();
    }

    protected abstract update(offset: number);

    public lookBack(offset: number): SeriesData<T> {
        return (x: number) => {
            const index = this.data.length - 1 - x - offset;
            if(index >= 0) {
                return this.data[index];
            }
            else {
                return undefined;
            }
        }
    }

    public getLength(): number {
        return this.data.length;
    }

    public getData(offset?:number) {
        if(!offset) {
            return this.data;
        } else {
            this.data.slice(this.data.length - offset, this.data.length);
        }
    }
}

export class RawSeries<T> extends Series<T> {

    public constructor(data: T[]) {
        super(data);
    }

    protected update(offset: number) {
        this.notifyAll(offset);
    }

    public updateData(offset: number, array: T[]) {
        if(offset == 0) {
            this.append(array);
        }

        this.data.splice(this.data.length - offset, offset);
        this.append(array);
    }

    public append(array: T[]) {
        const clone = array.slice(0);
        this.data = this.data.concat(clone);
    }
}

export class EvaluatedSeries<T> extends Series<T> {
    private static evaluationChain: EvaluatedSeries<any>[][] = [];

    protected depth: number;

    public constructor(data: T[], private expr: any, private deps: Series<any>[]) {
        super(data);

        let maxDepth = -1;
        
        deps.forEach(dep => {
            if(dep instanceof EvaluatedSeries) {
                maxDepth = maxDepth < dep.depth ? dep.depth : maxDepth;
            }
        })
        
        this.depth = maxDepth + 1;

        EvaluatedSeries.addSeriesToEvaluationChain(this);
    }

    public static evaluteUpdates(offset: number) {
        this.evaluationChain.forEach(seriesList => {
            if(seriesList) {
                seriesList.forEach(series => {
                    series.update(offset);
                })
            }
        });
    }

    protected static addSeriesToEvaluationChain(series: EvaluatedSeries<any>) {
        if(this.evaluationChain[series.depth]) {
            this.evaluationChain[series.depth].push(series);
        }
        else {
            this.evaluationChain[series.depth] = [series];
        }
    }

    protected update(offset: number) {
        this.data.splice(this.data.length - offset, offset);

        const args = this.deps;

        for(let i =0; i < offset; i++) {
            this.data.push(this.expr(...args.map(x => x.lookBack(offset - 1 - i))));
        }

        this.notifyAll(offset);
    }

    public 
}

export class OffsettedSeries<T> extends Series<T> {

    public constructor(private parentSeries: Series<T>, private seriesOffset: number) {
        super(null);
        this.parentSeries.subscribe(this.notifyAll, this);
    }

    public lookBack(offset: number): SeriesData<T> {
        return this.parentSeries.lookBack(offset + this.seriesOffset);
    }

    public getLength(): number {
        return this.parentSeries.getLength();
    }

    protected update(offset: number) {
        console.warn("Can't update series of type OffsettedSeries<T>");
    }

    public getData(offset?: number) {
        const data = this.parentSeries.getData();
        const length = data.length - this.seriesOffset; 
        if(!offset) {
            return data.slice(0, length);
        }
        else {
            return this.data.slice(length - offset, length);   
        }
    }
}

export class SimpleSeries extends Series<number> {

    public constructor(private parentSeries: Series<any>, private resolver: (data) => number) {
        super(null);

        this.parentSeries = parentSeries;

        this.parentSeries.subscribe(this.notifyAll, this);
    }

    public lookBack(offset: number): SeriesData<number> {
        const trueLookback = this.parentSeries.lookBack(offset);

        return (x: number) => {
            return this.resolver(trueLookback(x));
        }
    }

    public getLength(): number {
        return this.parentSeries.getLength();
    }

    protected update(offset: number) {
        console.warn("Can't update series of type ResolvableSeries");
    }

    public getData(offset?: number) {

        // todo: optimize multiple non-offsetted calls
        return this.parentSeries.getData(offset).map(value => this.resolver(value));
    }

}