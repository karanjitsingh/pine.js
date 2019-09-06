export enum Position {
    Long,
    Short
}

export interface OpenTrade {
    entry: number,
    leverage: number,
    orderValue: number,
    position: Position
}