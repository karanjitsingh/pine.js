import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { PlatformBase } from "Platform/PlatformBase";
import { Reporter } from "Model/Platform/Reporter";

export class Platform extends PlatformBase {
    protected readonly Network: INetwork;
    protected readonly Reporter: Reporter;

    constructor() {
        super();
        this.Network = new (require('./NodeNetwork').BrowserNetwork)();
    }

    public init() {

    }
}