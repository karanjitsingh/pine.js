import { Platform as NodePlatform } from "./Node/Platform";
import { Platform as BrowserPlatform } from "Platform/Browser/Platform";
import { Platform } from "./Platform";

export class PlatformFactory {
    public static getPlatform(): Platform {
        if(typeof(process) === 'object') {
            return new NodePlatform();
        } else {
            return new BrowserPlatform();
        }
    }
}