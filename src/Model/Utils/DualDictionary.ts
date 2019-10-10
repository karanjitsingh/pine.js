export class DualDictionary {
    /** Map with key as key */
    private map: {[id: string]: string} = {};

    /** Map with value as key */
    private inverseMap: {[value: string]: string} = {};

    public add(key: string, value: string) {
        this.map[key] = value;
        this.inverseMap[value] = key;
    }

    public get(key: string) {
        return this.map[key];
    }

    public inverseGet(value: string) {
        return this.inverseMap[value];
    }

    public removeByKey(key: string) : { key: string, value: string } | undefined {
        if(!this.map.hasOwnProperty(key)) {
            return undefined;
        }
        
        const value = this.map[key];

        this.remove(key, value);

        return {
            key: key,
            value: value
        }
    }
    
    public removeByValue(value: string) : { key: string, value: string } | undefined {
        if(!this.inverseMap.hasOwnProperty(value)) {
            return undefined;
        }

        const key = this.inverseMap[value];

        this.remove(key, value);

        return {
            key: key,
            value: value
        };
    }

    private remove(key: string, value: string) {
        delete this.map[key];
        delete this.inverseMap[value]
    }
}