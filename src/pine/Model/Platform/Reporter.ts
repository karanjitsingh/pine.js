import { ChartData } from "Model/Platform/Contracts";
import { Trade, Plot } from "Model/Data/Trading";
import { Series } from "Model/Data/Series";

export interface ReporterData {
    Charts: ChartData[],
    TradeData: Trade[]
}

export interface IReporter {
    plotUpdate();
    tradeBookUpdate();
    init(reporterData: ReporterData);
}