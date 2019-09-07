import { IndicatorConfig, Resolution } from "Model/Contracts";
import { Series } from "Model/Data/Series";
import { MarketData } from "Model/Data/Data";

export type Indicator = IndicatorConfig & { Series: Series<number> };

export type Plot = {
    Resolution: Resolution;
    Indicators: Indicator[];
};

export type RawPlot = {
    Title?: string;
    MarketData: MarketData;
    Indicators: Indicator[]
}

export type PlotMap = {[id: string]: Plot};