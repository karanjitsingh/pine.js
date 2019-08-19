import { Series } from "Model/Data/Series";
import { Trade, Plot } from "Model/Data/Trading";

export abstract class Reporter {
    
    public constructor(protected plot: Plot[], protected tradeBook: Series<Trade>) {
        tradeBook.subscribe(this.TradeBookUpdate, this);
    }

    protected abstract PlotUpdate();

    protected abstract TradeBookUpdate();
}