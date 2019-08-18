import { INetwork } from "Model/Platform/Network";
import { IBroker } from "Model/Exchange/IBroker";
import { IExchange } from "Model/Exchange/IExchange";

export class ExchangeManager {
    public static registeredExchanges: {[id:string]: new (network: INetwork, broker: IBroker) => IExchange}

    public static register(name: string, exchangeCtor: new (network: INetwork, broker: IBroker) => IExchange) {
        if (ExchangeManager.registeredExchanges[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        ExchangeManager.registeredExchanges[name] = exchangeCtor;
    }
}