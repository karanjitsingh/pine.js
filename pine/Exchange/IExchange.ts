export interface IExchange {
    getData(startTime: number, endTime: number, resolution: Resolution): Promise<Candle[]>;
    subscribe(handle: (candle: Candle) => void); 
}

export enum Resolution {
    _1m = "1m",
    _3m = "3m",
    _5m = "5m",
    _15m = "15m",
    _30m = "30m",
    _1h = "1h",
    _2h = "2h",
    _4h = "4h",
    _d = "d"
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