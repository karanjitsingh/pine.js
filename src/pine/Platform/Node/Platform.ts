import { INetwork } from "Model/Platform/Network";
import { PlatformBase } from "Platform/PlatformBase";
import { IReporter } from "Model/Platform/Reporter";

export class Platform extends PlatformBase {
    protected readonly Network: INetwork;
    protected readonly Reporter: IReporter;

    constructor() {
        super();
        this.Network = new (require('./NodeNetwork').BrowserNetwork)();
    }

    protected _init(availableStrategies: string[],availableExchanges: string[]) {

    }
}