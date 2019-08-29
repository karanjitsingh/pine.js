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
    Resolution: string;
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