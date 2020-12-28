import * as http from "http";
import { Dictionary } from "Model/Contracts";
import * as path from "path";
import { Platform } from "Platform/Platform";
import { URL } from "url";
import * as WebSocket from "ws";

export type RestMethods = {
    "post": { [path: string]: PostMethod },
    "get": { [path: string]: GetMethod }
};

export type PostReply = Promise<number>;
export type GetReply = Promise<number>;

export type PostMethod = (url: URL, body: any, res: http.ServerResponse) => PostReply;
export type GetMethod = (url: URL, res: http.ServerResponse) => GetReply;

export const Constants = {
    pineBin: path.join(path.dirname(path.dirname(__dirname))),
    browserBin: path.join(path.dirname(__dirname), "Reporters", "Browser"),
    pine: path.dirname(path.dirname(__dirname))
};

export interface PlatformInstance {
    key: string;
    platform: Platform;
    websocketServer: WebSocket.Server | null;
    connections: Dictionary<WebSocket>;
}
