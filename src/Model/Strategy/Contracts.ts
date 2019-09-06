import { ChartConfig, IndicatorConfig } from "Model/Contracts";
import { Series } from "Model/Data/Series";

export type Indicator = IndicatorConfig & { Series: Series<number> };

export type Plot = ChartConfig & {
    Indicators: Indicator[];
};

export type PlotMap = {[id: string]: Plot};