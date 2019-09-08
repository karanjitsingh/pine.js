import { IndicatorConfig, Resolution, ResolutionMapped } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { Series } from "Model/Series/Series";
import { CtorStore } from "Model/Utils/CtorStore";
import { MessageLogger } from "Platform/MessageLogger";

export type Indicator = IndicatorConfig & { Series: Series<number> };

export type RawPlot = {
    Title?: string;
    MarketData: MarketData;
    Indicators: Indicator[]
}

export type StrategyCtor = new (broker: IBroker, messageLogger: MessageLogger) => Strategy;

export interface StrategyConfig {
    resolutionSet: Resolution[];
    initCandleCount: number;
}

export const StrategyStore = new CtorStore<StrategyCtor>();

export abstract class Strategy {
    public abstract readonly StrategyConfig: StrategyConfig;

    public abstract init(input: ResolutionMapped<MarketData>): RawPlot[];    
    public abstract tick(offset: ResolutionMapped<number>): void;

    public constructor(protected readonly broker: IBroker, protected readonly messageLogger: MessageLogger) {}
}
