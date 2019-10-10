// ------------------------------------------------------------------------------------------------
// Trading ----------------------------------------------------------------------------------------

export interface Wallet {
    Currency: string,
    Balance: number;
    OrderMargin: number;
    PositionMargin: number;
}

export type Side = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';

// To filter by multiple statuses, separate with a comma like so: Filled,New
export type OrderStatus = "Created" | "Rejected" | "New" | "PartiallyFilled" | "Filled" | "Cancelled";

export interface Order<T = {}> {
    OrderId: string;
    Side: Side;
    Symbol: string;
    OrderType: OrderType;
    OrderStatus: OrderStatus;
    Quantity: number;
    FilledQuantity: number;
    Price: number;
    TimeInForce: string;

    /** Conditional order specific field */
    CloseOnTrigger?: boolean

    IsOpen: boolean,

    ExtraFields?: T
}

export interface Position<T = {}> {
    PositionId: string,
    Side: Side,
    Symbol: string,
    Size: number,
    PositionValue: number,
    EntryPrice: number,
    Leverage: number,
    AutoAddMargin: boolean,
    PositionMargin: number,
    LiquidationPrice: number,
    BankrupcyPrice: number,
    ClosingFee: number,
    FundingFee: number,
    TakeProfit: number,
    StopLoss: number,
    TrailingProfit: number,
    PositionStatus: string,
    UsedMargin: number,
    UnrealizedPnl: number,
    CreatedAt: string,
    LastUpdate: string,
    IsOpen: boolean,

    ExtraFields: T
}

// ------------------------------------------------------------------------------------------------
// Typing -----------------------------------------------------------------------------------------

export type Dictionary<TValue, TKey extends string = string> = { [key in TKey]: TValue };

export type Update<T> = { [key in keyof T]?: boolean };

export type Partial<T> = { [key in keyof T]?: T[key] };

/** Tick number */
export type UtcTimeStamp = number;

/** Just to notify that string will wrap a primitive type T, "0.05"~StringWrapped<number> */ 
export type StringWrapped<T> = string;

/** Timestamp of the format "2018-10-15T04:12:19.000Z" */
export type Timestamp = string;

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
    ChartData: Dictionary<ChartData>,
    Orders: Order[],
    Positions: Position[]
}

// ------------------------------------------------------------------------------------------------
// Reporter Protocol ------------------------------------------------------------------------------

export type MessageType = keyof MessageContract;

export type ProtocolMessage<T extends MessageType> = { Type: T } & MessageContract[T];

export interface MessageContract {
    ReporterData: {
        Data: Partial<ReporterData>
    };

    ReporterConfig: {
        PlotConfig: Dictionary<PlotConfig>
    };
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------