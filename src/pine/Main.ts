import { PlatformFactory } from "Platform/PlatformFactory";
import { Strategy } from "Model/Strategy/Strategy";
import { StochasticStrategy } from "Strategy/StochasticStrategy";
import { ByBitExchange } from "Exchange/ByBit/ByBitExchange";
import { Exchange } from "Model/Exchange/Exchange";

Strategy.Register("Stochastic Strategy", StochasticStrategy);
Exchange.Register("ByBit", ByBitExchange);

const plat = PlatformFactory.getPlatform();
plat.init();