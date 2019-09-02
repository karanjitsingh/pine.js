export class DataStream<T> extends EventTarget {
    private data: T[] = [];
    private onDataPush: Event = new Event('data');

    public length(): number {
        return this.data.length;
    }

    public push(data: T) {
        this.data.push(data);
        this.dispatchEvent(this.onDataPush)
    }

    public flush(): T[] {
        if(this.data.length > 0) {
            return this.data.splice(0, this.data.length);
        } else {
            return [];
        }
    }

    public pop(): T {
        if(this.data.length > 0) {
            return this.data.pop()
        } else {
            return null;
        }
    }
}