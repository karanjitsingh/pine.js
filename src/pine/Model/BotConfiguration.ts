export interface BotConfiguration {
    Strategy: string,
    Exchange: string,
    TradeSettings?: {
        AuthToken: string
    }
    BacktestSettings?: {}
}
