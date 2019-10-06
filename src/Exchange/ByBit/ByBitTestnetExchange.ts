import { ByBitExchange } from "./ByBitExchange";
import { ByBitApi } from "./ByBitApi";
import { INetwork } from "Model/Network";

export class ByBitTestnetExchange extends ByBitExchange {
    protected websocketEndpoint: string = "wss://stream-testnet.bybit.com/realtime";
    
    constructor(protected network: INetwork) {
        super(network);
        this.api = new ByBitApi(network, true);
    }
}