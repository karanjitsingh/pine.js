export enum PlotType {
    Area,
    Line
}

export interface ChartData {
    Data: Candle[];
    IndicatorData: number[][];
}

export interface PlatformConfiguration {
    Strategy: string,
    Exchange: string,
    TradeSettings?: {
        AuthToken: string
    }
    BacktestSettings?: {}
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
    Plots: {[id: string]: ChartData},
    TradeData: Trade[]
}

export type MessageType = "ReporterData" | "ReporterConfig" ;

export type ReporterDataMessage = {
    data: ReporterData;
}

export type ReporterInitMessage = {
    count: number;
}

export type ProtocolMessage<T extends MessageType> = { Type: T } & MessageContract[T];

export interface MessageContract {
    ReporterData: {
        Data: ReporterData
    };

    ReporterConfig: {
        PlotConfig: PlotConfigMap
    };
}

export interface IndicatorConfig {
    Title?: string;
    PlotType: PlotType;
}

export interface ChartConfig {
    Title?: string;
    Resolution: Resolution;
}

export type PlotConfig = ChartConfig & {
    IndicatorConfigs: IndicatorConfig[];
}

export type PlotConfigMap = {[id: string]: PlotConfig};

export type Resolution = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "3h" | "4h" | "6h" | "1d" | "3d" | "1w" | "2w";