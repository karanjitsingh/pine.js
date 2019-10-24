import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { ByBitTestnetExchange } from "Exchange/ByBit/ByBitTestnetExchange";
import { ExchangeStore } from "Model/Exchange/Exchange";
import { StrategyStore } from "Model/Strategy/Strategy";
import { Utils } from "Model/Utils/Utils";
import { Server } from "Server/Server";
import { StochasticStrategy } from "Strategy/StochasticStrategy";

StrategyStore.register("Stochastic Strategy", StochasticStrategy);
ExchangeStore.register("ByBit", ByBitExchange);
ExchangeStore.register("ByBit Testnet", ByBitTestnetExchange);

Server.getInstance().start();

if (process.argv.includes("autoinit")) {
    const config = Utils.GetTestConfig();
    const id = Server.platformControl.addPlatform(config);
    const instance = Server.platformControl.getPlatformInstance(id);
    instance.platform.start();
}

(Number as any).prototype.toInt = function() {
    return Math.floor(this);
} 