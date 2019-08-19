import { IPlatform } from "Model/Platform/IPlatform";
import { INetwork } from "Model/Platform/Network";
import { PlatformType } from "Model/Platform/PlatformType";
import { MessageLogger } from "./MessageLogger";

export abstract class Platform implements IPlatform {
    abstract readonly Network: INetwork;
    abstract readonly PlatformType: PlatformType;

    protected readonly MessageLogger: MessageLogger;

    public constructor() {
        this.MessageLogger = new MessageLogger();
    }

    abstract init();
}
