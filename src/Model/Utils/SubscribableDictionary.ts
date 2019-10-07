import { Subscribable } from "Model/Utils/Events";
import { Dictionary } from "Model/Contracts";

export interface DictionaryUpdate<T> {
    UpdateType: 'Add' | 'Remove' | 'Update';
    Value: Readonly<T>;
}

export class SubscribableDictionary<T> extends Subscribable<DictionaryUpdate<T>> {
    private dict: Dictionary<Readonly<T>> = {};

    public add(key: string, value: T) {
        if(this.dict[key]) {
            throw new Error(`Value with key '${key}' already exists.`)
        }

        this.addOrUpdate(key, value);

        this.notifyAll({
            UpdateType: 'Add',
            Value: this.dict[key]
        });
    }

    public update(key: string, value: T) {
        if(!this.dict[key]) {
            throw new Error(`Value with key '${key}' does not exist.`)
        }

        this.addOrUpdate(key, value);

        this.notifyAll({
            UpdateType: 'Update',
            Value: this.dict[key]
        });
    }
    
    public addOrUpdate(key: string, value: T) {
        Object.freeze(value);

        this.dict[key] = value;
    }

    public remove(key: string) {
        if(!this.dict[key]) {
            throw new Error(`Value with key '${key}' does not exist.`)
        }

        const order = this.dict[key];
        delete this.dict[key];

        this.notifyAll({
            UpdateType: 'Remove',
            Value: order
        });
    }

    public get(key: string): Readonly<T> | null {
        if(this.dict[key]) {
            return this.dict[key];
        }

        return null;
    }

    public get keys(): string[] {
        return Object.keys(this.dict);
    }
    
    public get values(): T[] {
        return Object.values(this.dict);
    }
}