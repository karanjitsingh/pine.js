import { ChartData } from "Platform/Browser/Components/Contracts";
import { Trade, Plot } from "Model/Data/Trading";
import { Series } from "Model/Data/Series";

export interface ReporterData {
    Charts: ChartData[],
    TradeData: Trade[]
}

export abstract class Reporter {
    
    public constructor(protected reporterData: ReporterData) {
    }

    protected abstract PlotUpdate();

    protected abstract TradeBookUpdate();
}