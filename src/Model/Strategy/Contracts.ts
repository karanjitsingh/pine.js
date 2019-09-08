import { IndicatorConfig } from "Model/Contracts";
import { MarketData } from "Model/Data/Data";
import { Series } from "Model/Data/Series";

export type Indicator = IndicatorConfig & { Series: Series<number> };

export type RawPlot = {
    Title?: string;
    MarketData: MarketData;
    Indicators: Indicator[]
}