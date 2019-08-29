import { Strategy } from "Model/Strategy/Strategy";
import { StochasticStrategy } from "Strategy/StochasticStrategy";
import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { PineServer } from "PineServer";
import { Exchange } from "Model/Exchange/Exchange";

Strategy.Register("Stochastic Strategy", StochasticStrategy);
Exchange.Register("ByBit", ByBitExchange);

PineServer.start();