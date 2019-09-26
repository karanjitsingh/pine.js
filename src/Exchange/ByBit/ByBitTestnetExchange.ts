import { ByBitExchange } from "./ByBitExchange";

export class ByBitTestnetExchange extends ByBitExchange {
    protected websocketEndpoint: string = "wss://stream-testnet.bybit.com/realtime";
    protected baseApiEndpoint: string = "https://api-testnet.bybit.com/v2"
}