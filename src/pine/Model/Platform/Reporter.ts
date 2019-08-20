import { ChartData } from "Platform/Browser/Components/Contracts";
import { Trade, Plot } from "Model/Data/Trading";
import { Series } from "Model/Data/Series";

export interface ReporterData {
    Charts: ChartData[],
    TradeData: Trade[]
}

export abstract class Reporter {
    
    private reporterData: ReporterData;

    public constructor() {
    }

    public abstract PlotUpdate();

    public abstract TradeBookUpdate();

    public init(reporterData: ReporterData) {
        this.reporterData = reporterData;
    }
}