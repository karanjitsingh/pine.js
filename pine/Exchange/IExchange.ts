export interface IExchange {
    getData(startTime: number, endTime: number, resolution: Resolution): Candle[];
    subscribe(handle: (candle: Candle) => void); 
}

export enum Resolution {

}

export interface Candle {
    startTick: number;
    endTick: number;
    high: number;
    open: number;
    close: number;
    low: number;
    volume: number;
}