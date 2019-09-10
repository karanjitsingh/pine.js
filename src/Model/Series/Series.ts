import { Candle, Resolution, ResolutionMapped } from "Model/Contracts";
import { Subscribable } from "Model/Utils/Events";

export type SeriesData<T = number> = (lookback: number) => T;

export interface UpdateIndex {
    offset: number;
    length: number;
}

export interface ISeries<T = number> extends Subscribable<UpdateIndex> {
    readonly Resolution: Resolution;
    lookBack(offset: number): SeriesData<T>
    getLength(): number;
    getData(offset?: number): T[];
    readonly Depth: number;
}

abstract class Series<T> extends Subscribable<UpdateIndex> implements ISeries<T> {
    public abstract readonly Resolution: Resolution;
    public abstract readonly Depth: number;

    protected constructor(protected data: T[]) {
        super();
    }

    protected abstract update(updateIndex: UpdateIndex): void;

    public lookBack(offset: number): SeriesData<T> {
        return (x: number) => {
            const index = this.data.length - 1 - x - offset;
            if (index >= 0) {
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

    public getData(offset?: number): T[] {
        if (!offset) {
            return this.data;
        } else {
            return this.data.slice(this.data.length - offset, this.data.length);
        }
    }
}

export class RawSeries<T> extends Series<T> {
    public readonly Resolution: Resolution;
    public readonly Depth: number = -1;

    public constructor(data: T[], resolution: Resolution) {
        super(data);
        this.Resolution = resolution;
    }

    protected update(updateIndex: UpdateIndex) {
        this.notifyAll(updateIndex);
    }

    public updateData(offset: number, array: T[]) {
        if (offset == 0) {
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
    public readonly Resolution: Resolution;
    public readonly Depth: number;

    private static evaluationGraph: ResolutionMapped<EvaluatedSeries<any>[][]> = {};

    public constructor(private expr: (self: SeriesData<T>, ...args: SeriesData<T>[]) => T, private deps: ISeries<T>[]) {
        super([]);

        const homogenousResolution: boolean = deps.reduce<boolean>((value, curr) => {
            return value && curr.Resolution == deps[0].Resolution;
        }, true);

        if (!homogenousResolution) {
            throw new Error("Dependencies must be of same resolution");
        }

        let maxDepth = -1;

        deps.forEach((dep: Series<T>) => {
            maxDepth = maxDepth < dep.Depth ? dep.Depth : maxDepth;
        })

        this.Depth = maxDepth + 1;

        EvaluatedSeries.addSeriesToEvaluationGraph(this, deps[0].Resolution);

        const maxLength = deps.reduce<number>((len, curr) => {
            return curr.getLength() > len ? curr.getLength() : len;
        }, 0);

        this.update({
            offset: 0,
            length: maxLength
        });
    }

    public static evaluteUpdates(resolutionMappedUpdate: ResolutionMapped<UpdateIndex>) {
        Object.keys(resolutionMappedUpdate).forEach((res: Resolution) => {
            const resolutionGraph = this.evaluationGraph[res];

            if (resolutionGraph) {
                const index = resolutionMappedUpdate[res];

                resolutionGraph.forEach(seriesList => {
                    if (seriesList) {
                        seriesList.forEach(series => {
                            series.update(index);
                        })
                    }
                });
            }
        });
    }

    protected static addSeriesToEvaluationGraph(series: EvaluatedSeries<any>, resolution: Resolution) {

        if (!this.evaluationGraph[resolution]) {
            this.evaluationGraph[resolution] = []
        }

        const resolutionGraph = this.evaluationGraph[resolution];

        if (resolutionGraph[series.Depth]) {
            resolutionGraph[series.Depth].push(series);
        }
        else {
            resolutionGraph[series.Depth] = [series];
        }
    }

    protected update(updateIndex: UpdateIndex) {
        this.data.splice(this.data.length - updateIndex.offset, updateIndex.offset);

        const args = this.deps;

        for (let i = 0; i < updateIndex.length; i++) {
            this.data.push(this.expr(this.lookBack(-1), ...args.map(x => x.lookBack(updateIndex.length - 1 - i))));
        }

        this.notifyAll(updateIndex);
    }
}

export class OffsettedSeries<T> extends Series<T> {
    public readonly Resolution: Resolution;
    public readonly Depth: number;

    public constructor(private parentSeries: ISeries<T>, private seriesOffset: number) {
        super(null);
        this.parentSeries.subscribe(this.notifyAll, this);
        this.Resolution = this.parentSeries.Resolution;
        this.Depth = this.parentSeries.Depth;
    }

    public lookBack(offset: number): SeriesData<T> {
        return this.parentSeries.lookBack(offset + this.seriesOffset);
    }

    public getLength(): number {
        return this.parentSeries.getLength();
    }

    protected update() {
        console.warn("Can't update series of type OffsettedSeries<T>");
    }

    public getData(offset?: number) {
        const data = this.parentSeries.getData();
        const length = data.length - this.seriesOffset;
        if (!offset) {
            return data.slice(0, length);
        }
        else {
            return this.data.slice(length - offset, length);
        }
    }
}

export class SimpleSeries<T = Candle> extends Series<number> {
    public readonly Resolution: Resolution;
    public readonly Depth: number;

    public constructor(private parentSeries: ISeries<T>, private resolver: (data: T) => number) {
        super(null);

        this.Resolution = parentSeries.Resolution;

        this.parentSeries = parentSeries;
        this.parentSeries.subscribe(this.notifyAll, this);

        this.Depth = parentSeries.Depth;
    }

    public lookBack(offset: number): SeriesData {
        const trueLookback = this.parentSeries.lookBack(offset);

        return (x: number) => {
            const lookback = trueLookback(x);
            if(lookback === undefined) {
                return undefined;
            }

            return this.resolver(lookback);
        }
    }

    public getLength(): number {
        return this.parentSeries.getLength();
    }

    protected update() {
        console.warn("Can't update series of type ResolvableSeries");
    }

    public getData(offset?: number) {

        // todo: optimize multiple non-offsetted calls
        return this.parentSeries.getData(offset).map(value => this.resolver(value));
    }

}