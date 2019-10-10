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
    }

    public update(key: string, value: T) {
        if(!this.dict[key]) {
            throw new Error(`Value with key '${key}' does not exist.`)
        }

        this.addOrUpdate(key, value);
    }
    
    public addOrUpdate(key: string, value: T) {
        Object.freeze(value);

        let update: DictionaryUpdate<any>['UpdateType'];

        if(this.dict[key]) {
            update = 'Update';
        } else {
            update = 'Add'
        }

        this.dict[key] = value;
         
        this.notifyAll({
            UpdateType: update,
            Value: this.dict[key]
        });
    }

    public remove(key: string): T {
        const value = this.tryRemove(key);

        if(value) {
            return value;
        } else {
            throw new Error(`Value with key '${key}' does not exists.`);
        }
    }

    public tryRemove(key: string): T | null {
        if(this.dict[key]) {
            const value = this.dict[key];
            delete this.dict[key];

            this.notifyAll({
                UpdateType: 'Remove',
                Value: value
            });

            return value;
        }

        return null;
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