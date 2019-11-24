import { StochasticStrategyBase } from "./StochasticStrategyBase";
import { ResolutionMapped, IAccount, Resolution } from "Model/Contracts";

export class StochasticStrategy extends StochasticStrategyBase {
    

    // protected heikenashi30m: MarketData;
    // protected currentPosition: Position;

    // protected leading: ISeries;
    // protected lagging: ISeries;
    // protected diff: ISeries;
    // protected shape: ISeries;

    public update(updateOffset: ResolutionMapped<number>) {
        /**
         * if lagging wave d goes into k from below, then long
         * if lagging wave d goes into k from above, then short
         * 
         * close position if opposite happens
         * 
         * keep a stop loss 
         * 
         * consolidation mode?
         */

        if(this.currentPosition) {
            this.exit(updateOffset);
        } else {
            this.entry(updateOffset);
        }

        if(updateOffset['30m']) {
            this.heikenashi30m.Candles.getData(10);



        }
    }

    public trade(update: Partial<IAccount>) {

    }

    private entry(updateOffset: ResolutionMapped<number>) {
        const lookback = Math.max(10, updateOffset['30m']);

        const d = this.lagging.getData(lookback);
        const k = this.leading.getData(lookback);

        for(let i = 9; i >= 0; i--) {
            // if(d[i] > k[i])ms
        }

    }

    private exit(updateOffset: ResolutionMapped<number>) {

    }

}