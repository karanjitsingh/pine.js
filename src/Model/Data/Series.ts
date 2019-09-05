import { Subscribable } from "Model/Events";
import { Candle } from "Model/Contracts";
import { Resolution, ResolutionMapped } from "./Data";

export type SeriesData<T> = (lookback: number) => T;

export interface UpdateIndex {
    offset: number;
    length: number;
}

export abstract class Series<T> extends Subscribable<UpdateIndex> {
    public abstract readonly Resolution: Resolution;

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

    public constructor(data: T[], resolution: Resolution) {
        super(data);
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

    private static evaluationGraph: ResolutionMapped<EvaluatedSeries<any>[][]> = {};

    protected depth: number;

    public constructor(private expr: any, private deps: Series<any>[]) {
        super([]);

        const homogenousResolution: boolean = deps.reduce<boolean>((value, curr) => {
            return value && curr.Resolution == deps[0].Resolution;
        }, true);

        if (!homogenousResolution) {
            throw new Error("Dependencies must be of same resolution");
        }

        let maxDepth = -1;

        deps.forEach(dep => {
            if (dep instanceof EvaluatedSeries) {
                maxDepth = maxDepth < dep.depth ? dep.depth : maxDepth;
            }
        })

        this.depth = maxDepth + 1;

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
        Object.keys(resolutionMappedUpdate).forEach((res) => {
            const resolutionGraph = this.evaluationGraph[res];
            const index = resolutionMappedUpdate[res];

            resolutionGraph.forEach(seriesList => {
                if (seriesList) {
                    seriesList.forEach(series => {
                        series.update(index);
                    })
                }
            });
        });
    }

    protected static addSeriesToEvaluationGraph(series: EvaluatedSeries<any>, resolution: Resolution) {

        if (!this.evaluationGraph[resolution]) {
            this.evaluationGraph[resolution] = []
        }

        const resolutionGraph = this.evaluationGraph[resolution];

        if (resolutionGraph[series.depth]) {
            resolutionGraph[series.depth].push(series);
        }
        else {
            resolutionGraph[series.depth] = [series];
        }
    }

    protected update(updateIndex: UpdateIndex) {
        this.data.splice(this.data.length - updateIndex.offset, updateIndex.offset);

        const args = this.deps;

        for (let i = 0; i < updateIndex.length; i++) {
            this.data.push(this.expr(...args.map(x => x.lookBack(updateIndex.length - 1 - i))));
        }

        this.notifyAll(updateIndex);
    }
}

export class OffsettedSeries<T> extends Series<T> {
    public readonly Resolution: Resolution;

    public constructor(private parentSeries: Series<T>, private seriesOffset: number) {
        super(null);
        this.parentSeries.subscribe(this.notifyAll, this);
        this.Resolution = this.parentSeries.Resolution;
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

    public constructor(private parentSeries: Series<T>, private resolver: (data: T) => number) {
        super(null);

        this.Resolution = parentSeries.Resolution;

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

    protected update() {
        console.warn("Can't update series of type ResolvableSeries");
    }

    public getData(offset?: number) {

        // todo: optimize multiple non-offsetted calls
        return this.parentSeries.getData(offset).map(value => this.resolver(value));
    }

}