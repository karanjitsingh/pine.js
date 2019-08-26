import { Strategy } from "Model/Strategy/Strategy";
import { StochasticStrategy } from "Strategy/StochasticStrategy";
import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { Exchange } from "Model/Exchange/Exchange";
import { PineServer } from "PineServer";

Strategy.Register("Stochastic Strategy", StochasticStrategy);
Exchange.Register("ByBit", ByBitExchange);

PineServer.start();