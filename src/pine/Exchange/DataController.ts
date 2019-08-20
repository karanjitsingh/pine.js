import { Subscribable } from "Model/Events";
import { Candle } from "Model/Data/Data";
import { Exchange } from "Model/Exchange/Exchange";

export class DataController extends Subscribable<number> {

    public constructor(private exchange: Exchange) {
        super();    
    }
}