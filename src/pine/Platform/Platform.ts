import { IPlatform } from "Model/Platform/IPlatform";
import { INetwork } from "Model/Platform/Network";
import { PlatformType } from "Model/Platform/PlatformType";

export abstract class Platform implements IPlatform {
    abstract readonly Network: INetwork;
    abstract readonly PlatformType: PlatformType;

    abstract init();
}
