import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { ExchangeStore } from "Model/Exchange/Exchange";
import { StrategyStore } from "Model/Strategy/Strategy";
import { Server } from "Server/Server";
import { StochasticStrategy } from "Strategy/StochasticStrategy";

StrategyStore.register("Stochastic Strategy", StochasticStrategy);
ExchangeStore.register("ByBit", ByBitExchange);

Server.getInstance().start();

const id = Server.platformControl.addPlatform({
    Exchange: "ByBit",
    Strategy: "Stochastic Strategy",
    TradeSettings: {
        AuthToken: "Asdf"
    }
});

const instance = Server.platformControl.getInstance(id);

instance.platform.start();

