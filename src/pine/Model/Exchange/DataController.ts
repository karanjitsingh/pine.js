import { Subscribable } from "Model/Events";
import { Exchange } from "Model/Exchange/Exchange";
import { SimpleSeries, RawSeries } from "Model/Data/Series";
import { StreamData } from "./DataStream";
import { Resolution, Candle } from "Model/Data/Data";

export interface MarketData {
    Candle: RawSeries<Candle>;
    Open: SimpleSeries,
    Close: SimpleSeries,
    High: SimpleSeries,
    Low: SimpleSeries,
    Volume: SimpleSeries
}

export interface TickUpdate {    
    updatedResolutions: Resolution[],
    lastTick: number,
    currentTick: number
}

export class DataController extends Subscribable<number> {

    public constructor(private exchange: Exchange, resolutionSet: Resolution[]) {
        super();

        exchange.DataStream.subscribe(this.onDataStream, this);
    }

    public getBaseData(): {[resolution: string]: MarketData} {
        
        // this.exchange.getData()

        return {};
    }

    private onDataStream(data: StreamData) {
        // fault check and update series;
    }
}