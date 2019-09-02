import { Strategy } from "Model/Strategy/Strategy";
import { StochasticStrategy } from "Strategy/StochasticStrategy";
import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { Server } from "Server/Server";
import { Exchange } from "Model/Exchange/Exchange";

Strategy.Register("Stochastic Strategy", StochasticStrategy);
Exchange.Register("ByBit", ByBitExchange);

Server.getInstance().start();

const id = Server.platformControl.addPlatform({
    Exchange: "ByBit",
    Strategy: "Stochastic Strategy",
    TradeSettings: {
        AuthToken: "Asdf"
    }
});

Server.platformControl.startPlatform(id);

