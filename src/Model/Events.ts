export type Delegate<TArgs> = (EventArgs: TArgs) => void;

export class PlatformEventEmitter<TEvent extends string> {    

    private events: { [id: string]: Array<[Delegate<any>, Object]>; } = {};
    private once: { [id: string]: Array<any>; } = {};

    public subsribeOnce(event: TEvent): Promise<any> {
        let resolution: (value: any) => void;
        const promise = new Promise((resolve) => { resolution = resolution});

        if(!this.once[event]) {
            this.once[event] = [resolution];
        } else {
            this.once[event].push(resolution);
        }

        return promise;
    }

    public subscribe(event: TEvent, listener: Delegate<any>, scope: object) {
        if(!this.events[event]) {
            this.events[event] = [];
        }

        const eventExists = this.events[event].filter((value) => {
            value[0] == listener && value[1] == scope;
        }).length > 0;

        if(!eventExists) {
            this.events[event].push([listener, scope]);
        }
    }

    public unsubscribe(event: TEvent, listener: Delegate<any>, scope: object) {
        if(this.events[event]) {
            this.events[event] = this.events[event].filter((handle) => {
                return handle[0] != listener || handle[1] != scope;
            });
        }
    }

    public emit(event: TEvent, args: any) {
        // subscribe once events
        if(this.once[event]) {
            for(let i=0;i<this.once[event].length; i++) {
                const resolution = this.once[event].pop();
                resolution(args);
            }
        }

        // persistance events
        const handles = this.events[event];
        if(handles) {
            for(var i = 0; i < handles.length; i++) {
                handles[i][0].call(handles[i][1], args);
            }
        }
    }

    public subscriberCount(event: string) {
        let count = 0;
        if(this.once[event]) {
            count += this.once[event].length;
        }

        if(this.events[event]) {
            count += this.events[event].length;
        }

        return count;
    }

}

export abstract class Subscribable<TArgs> {
    private emitter: PlatformEventEmitter<string>;

    constructor() {
        this.emitter = new PlatformEventEmitter();
    }
    
    public get subscriberCount(): number {
        return this.emitter.subscriberCount("event");
    }

    public subscribeOnce(): Promise<TArgs> {
        return this.emitter.subsribeOnce("event") as Promise<TArgs>;
    }

    public subscribe(listener: (e: TArgs) => void, scope: any) {
        this.emitter.subscribe("event", listener, scope);
    }

    public unsubscribe(listener: (e: TArgs) => void, scope: any) {
        this.emitter.subscribe("event", listener, scope);
    }

    public notifyAll(args: TArgs) {
        this.emitter.emit("event", args);
    }
}