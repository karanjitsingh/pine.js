import { Candle, Resolution } from "Model/Data/Data";
import { Trade } from "Model/Data/Trading";

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
    indicators: ChartIndicator[];
}