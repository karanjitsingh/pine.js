import { INetwork } from "Model/Platform/Network";
import { IBroker } from "Model/Exchange/IBroker";

export class ExchangeManager {
    public static registeredExchanges: {[id:string]: new (network: INetwork, broker: IBroker) => {}}

    public static register(name: string, exchangeCtor: new (network: INetwork, broker: IBroker) => {}) {
        if (ExchangeManager.registeredExchanges[name]) {
            console.warn("Overriding registered exchanged:", name);
        }

        ExchangeManager.registeredExchanges[name] = exchangeCtor;
    }
}