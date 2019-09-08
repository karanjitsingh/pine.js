import { Dictionary } from "Model/Contracts";

export class CtorStore<Ctor extends new (...args: any[]) => any> {

    private ctors: Dictionary<Ctor> = {}

    public register(key: string, factory: Ctor) {
        if (this.ctors[key]) {
            console.warn("Overriding registered ctor:", key);
        }

        this.ctors[key] = factory;
    }

    public entries(): string[] {
        return Object.keys(this.ctors);
    }

    public get(key: string): Ctor {
        return this.ctors[key];
    }
}
