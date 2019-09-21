export type PlotType = 'Area' | 'Line';

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
    StartTick: number;
    EndTick: number;
    High: number;
    Open: number;
    Close: number;
    Low: number;
    Volume: number;
}

export type Position = 'Long' | 'Short';

export interface OpenTrade {
    Entry: number,
    Leverage: number,
    OrderValue: number,
    Position: Position
}

export interface Trade {
    Position: Position
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
    ChartData?: Dictionary<ChartData>,
    TradeData?: Trade[]
}

export type MessageType = "ReporterData" | "ReporterConfig" ;

export type ProtocolMessage<T extends MessageType> = { Type: T } & MessageContract[T];

export interface MessageContract {
    ReporterData: {
        Data: ReporterData
    };

    ReporterConfig: {
        PlotConfig: Dictionary<PlotConfig>
    };
}

export interface IndicatorConfig {
    Title?: string;
    Color?: string;
    PlotType: PlotType;
}

export interface PlotConfig {
    Title?: string;
    Resolution: Resolution;
    IndicatorConfigs: IndicatorConfig[];
}

export type Resolution = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "3h" | "4h" | "6h" | "1d" | "3d" | "1w" | "2w";

export type Dictionary<T> = {[key: string]: T};

export type ResolutionMapped<T> = {[resolution in Resolution]?: T}; 