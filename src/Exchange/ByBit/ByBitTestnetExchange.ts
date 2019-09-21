import { ByBitExchange } from "./ByBitExchange";

export class ByBitTestnetExchange extends ByBitExchange {
    protected webSocketAddress: string = "wss://stream-testnet.bybit.com/realtime";
}