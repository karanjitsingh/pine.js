import { Platform as NodePlatform } from "./Node/Platform";
import { Platform as BrowserPlatform } from "Platform/Browser/Platform";
import { PlatformBase } from "./PlatformBase";

export class PlatformFactory {
    public static getPlatform(): PlatformBase {
        if(typeof(process) === 'object') {
            return new NodePlatform();
        } else {
            return new BrowserPlatform();
        }
    }
}