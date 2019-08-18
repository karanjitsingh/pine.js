import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { Platform as PlatformBase } from "Platform/Platform";

export class Platform extends PlatformBase {
    public readonly PlatformType: PlatformType;
    public readonly Network: INetwork;

    constructor() {
        super();
        this.Network = new (require('./NodeNetwork').BrowserNetwork)();
        this.PlatformType = PlatformType.Node;
    }

    public init() {

    }
}