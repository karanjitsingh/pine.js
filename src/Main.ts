import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { Exchange } from "Model/Exchange/Exchange";
import { Strategy } from "Model/Strategy/Strategy";
import { Server } from "Server/Server";
import { StochasticStrategy } from "Strategy/StochasticStrategy";

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

// const instance = Server.platformControl.getInstance(id);

// instance.platform.start();

