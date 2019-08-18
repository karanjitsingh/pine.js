import { INetwork } from "./Network";
import { PlatformType } from "./PlatformType";

export interface IPlatform {
    readonly Network: INetwork;
    readonly PlatformType: PlatformType;
}