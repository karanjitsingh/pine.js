export enum PlotType {
    Area,
    Line
}

export interface ChartIndicator {
    PlotType: PlotType,
    Data: number[]
}

export interface ChartData {
    Data: Array<Candle>;
    Name: string;
    Resolution: Resolution;
    Indicators: ChartIndicator[];
}


export interface BotConfiguration {
    Strategy: string,
    Exchange: string,
    TradeSettings?: {
        AuthToken: string
    }
    BacktestSettings?: {}
}


export interface ReporterData {
    Charts: ChartData[],
    TradeData: Trade[]
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

export enum Resolution {
    _1m = "1m",
    _3m = "3m",
    _5m = "5m",
    _15m = "15m",
    _30m = "30m",
    _1h = "1h",
    _2h = "2h",
    _4h = "4h",
    _12h = "12h",
    _d = "d"
}

export enum Tick
{
    Second = 1000,
    Minute = Second * 60,
    Hour = Minute * 60,
    Day = Hour * 24
}

export interface Trade {
    EntryTick: number;
    ExitTick: number;
    EntryPrice: number;
    ExitPrice: number;
    ProfitLoss: number;
    FeePaid: number;
    NetAccountValue: number;
    FillType: string;
}

export interface ReporterData {
    Charts: ChartData[],
    TradeData: Trade[]
}