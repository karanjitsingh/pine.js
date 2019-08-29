import { PlotType } from "Model/Contracts";
import { Series } from "./Series";
import { Resolution } from "./Data";

export interface Plot {
    Resolution: Resolution;
    Indicators: [PlotType, Series<number>][];
}

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