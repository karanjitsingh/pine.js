export class DataStream<T> {
    private data: T[] = [];
    private onDataPushEvent: Event = new Event("data");
    private eventTarget: EventTarget = new EventTarget();

    public length(): number {
        return this.data.length;
    }

    public subscribe(listener: EventListenerOrEventListenerObject) {
        this.eventTarget.addEventListener("data", listener);
    }

    public unsubscribe(listener: EventListenerOrEventListenerObject) {
        this.eventTarget.removeEventListener("data", listener);
    }

    public hasUpdate(): boolean {
        return this.data.length > 0;
    }

    public push(data: T | T[]) {

        if (data instanceof Array) {
            if (!data.length) {
                return;
            }
            this.data.push(...data);
        } else {
            this.data.push(data);
        }

        this.eventTarget.dispatchEvent(this.onDataPushEvent);
    }

    public flush(): T[] {
        if (this.data.length > 0) {
            return this.data.splice(0, this.data.length);
        } else {
            return [];
        }
    }

    public pop(): T {
        if (this.data.length > 0) {
            return this.data.pop();
        } else {
            return null;
        }
    }
}