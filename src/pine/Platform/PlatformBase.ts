import { INetwork } from "Model/Platform/Network";
import { MessageLogger } from "./MessageLogger";
import { Reporter } from "Model/Platform/Reporter";

export abstract class PlatformBase {
    protected abstract readonly Network: INetwork;
    protected abstract readonly Reporter: Reporter;

    protected readonly MessageLogger: MessageLogger;

    public constructor() {
        this.MessageLogger = new MessageLogger();
    }

    abstract init();
}
