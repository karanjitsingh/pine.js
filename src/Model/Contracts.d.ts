// ------------------------------------------------------------------------------------------------
// Trading ----------------------------------------------------------------------------------------

export interface Account {
    Position: null;
    Balance: number;
    Leverage: number;
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

// ------------------------------------------------------------------------------------------------
// Typing -----------------------------------------------------------------------------------------

export type Dictionary<T> = { [key: string]: T };

export type Update<T> = { [key in keyof T]?: boolean };

export type Partial<T> = { [key in keyof T]?: T[key] };

// ------------------------------------------------------------------------------------------------
// Configuration ----------------------------------------------------------------------------------

export type PlotType = 'Area' | 'Line';

export interface ExchangeAuth {
    ApiKey: string,
    Secret: string
}

export interface IndicatorConfig {
    Title?: string;
    Color?: string;
    PlotType: PlotType;
}

export interface PlatformConfiguration {
    Strategy: string,
    Exchange: string,
    ExchangeAuth?: ExchangeAuth,
    BacktestSettings?: {}
}

export interface PlotConfig {
    Title?: string;
    Resolution: Resolution;
    IndicatorConfigs: IndicatorConfig[];
}

// ------------------------------------------------------------------------------------------------
// Data -------------------------------------------------------------------------------------------

export type Resolution =
"1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" |
"3h" | "4h" | "6h" | "1d" | "3d" | "1w" | "2w";

export type ResolutionMapped<T> = { [resolution in Resolution]?: T };

export interface Candle {
    StartTick: number;
    EndTick: number;
    High: number;
    Open: number;
    Close: number;
    Low: number;
    Volume: number;
}

// ------------------------------------------------------------------------------------------------
// Reporter ---------------------------------------------------------------------------------------

export interface ChartData {
    Data: Candle[];
    IndicatorData: number[][];
}

export interface ReporterData {
    ChartData?: Dictionary<ChartData>,
    TradeData?: Trade[]
}

// ------------------------------------------------------------------------------------------------
// Reporter Protocol ------------------------------------------------------------------------------

export type MessageType = keyof MessageContract;

export type ProtocolMessage<T extends MessageType> = { Type: T } & MessageContract[T];

export interface MessageContract {
    ReporterData: {
        Data: ReporterData
    };

    ReporterConfig: {
        PlotConfig: Dictionary<PlotConfig>
    };
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------