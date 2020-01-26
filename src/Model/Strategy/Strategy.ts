import { IndicatorConfig, Order, Resolution, ResolutionMapped, IAccount } from "Model/Contracts";
import { IBroker } from "Model/Exchange/IBroker";
import { MarketData } from "Model/InternalContracts";
import { ISeries } from "Model/Series/Series";
import { CtorStore } from "Model/Utils/CtorStore";
import { ReporterInterface } from "Platform/ReporterInterface";

export type Indicator = IndicatorConfig & { Series: ISeries<number> };

export type RawPlot = {
    Title?: string;
    MarketData: MarketData;
    Indicators: Indicator[]
}

export type StrategyCtor = new (reporter: ReporterInterface) => Strategy;

export interface StrategyConfig {
    resolutionSet: Resolution[];
    initCandleCount: number;
    symbol: string;
}

export const StrategyStore = new CtorStore<StrategyCtor>();

export abstract class Strategy {
    protected broker: IBroker;

    public abstract readonly StrategyConfig: StrategyConfig;

    public abstract init(input: ResolutionMapped<MarketData>, broker: IBroker): RawPlot[];  
    
    public abstract update(update: ResolutionMapped<number>): void;

    public abstract trade(update: Partial<IAccount>): void;

    public setBroker(broker: IBroker) {
        this.broker = broker;
    }

    public constructor(protected readonly reporter: ReporterInterface) {}
}
