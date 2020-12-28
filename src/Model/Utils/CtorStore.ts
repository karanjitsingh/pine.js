import { Dictionary } from "Model/Contracts";

export class CtorStore<Ctor extends new (...args: any[]) => any> {

    private ctors: Dictionary<Ctor> = {};

    public constructor(private throwOnDuplicate: boolean = true) { }

    public register(key: string, factory: Ctor) {
        if (this.ctors[key]) {
            if (this.throwOnDuplicate) {
                console.warn("Overriding registered ctor:", key);
            } else {
                throw new Error(`Duplicate entry for key '${key}' in CtorStore<${factory && factory.name ? factory.name : ""}>.`);
            }
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
