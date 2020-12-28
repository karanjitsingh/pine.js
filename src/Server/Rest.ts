import * as fs from "fs";
import * as http from "http";
import { PlatformConfiguration, ReporterInit } from "Model/Contracts";
import { ExchangeStore } from "Model/Exchange/Exchange";
import { StrategyStore } from "Model/Strategy/Strategy";
import { Utils } from "Model/Utils/Utils";
import * as path from "path";
import { Server } from "Server/Server";
import { Constants, GetReply, PostReply, RestMethods } from "Server/ServerContracts";
import * as ServerUtils from "Server/ServerUtils";
import { URL } from "url";

export const rest: RestMethods = {
    "post": {
        "/api/create": (url: URL, config: PlatformConfiguration, res: http.ServerResponse): PostReply => {
            // todo: better way of handling default configs
            if ((config as any).default) {
                config = Utils.GetTestConfig();
            }

            if (!Utils.Validations.ValidateBotConfig(config)) {
                res.writeHead(400);
                res.end();
                return Promise.resolve(400);
            }

            const key = Server.platformControl.addPlatform(config);
            const platform = Server.platformControl.getPlatformInstance(key).platform;

            res.writeHead(200);
            res.end(JSON.stringify({
                key: key,
                config: platform.StrategyConfig
            }));
            return Promise.resolve(200);
        }
    },
    "get": {
        "/api/init": (url: URL, res: http.ServerResponse): GetReply => {
            res.writeHead(200);
            res.end(JSON.stringify({
                availableStrategies: StrategyStore.entries(),
                availableExchanges: ExchangeStore.entries(),
                runningInstances: Server.platformControl.getRunningInstances()
            } as ReporterInit));

            return Promise.resolve(200);
        },
        "/pine": (url: URL, res: http.ServerResponse): GetReply => {
            const file = path.join(Constants.pineBin, url.pathname.replace("/pine", ""));
            let resolver: (code: number) => void;
            const promise = new Promise<number>((resolve) => resolver = resolve);

            if (fs.existsSync(file)) {
                fs.readFile(file, (err, content) => {
                    if (err) {
                        res.writeHead(500, {
                            "Content-Type": "text/HTML"
                        });

                        res.end(err.toString());
                        resolver(500);
                    } else {
                        res.writeHead(200, {
                            "Content-Type": ServerUtils.getContentType(file)
                        });

                        res.end(content);
                        resolver(200);
                    }
                });
            } else {
                res.writeHead(404);
                res.end();
                resolver!(404);
            }

            return promise;
        },
        "/api/connect": (url: URL, res: http.ServerResponse): GetReply => {
            const id = url.searchParams.get("id");

            if (!id) {
                res.writeHead(400);
                res.end("Param id not provided.");
                return Promise.resolve(400);
            }

            if (!Server.platformControl.getPlatformInstance(id)) {
                res.writeHead(400);
                res.end();
                return Promise.resolve(400);
            }

            const address = Server.platformControl.createSocketStream(id);

            if (address) {
                res.writeHead(200);
                res.end(address);
                return Promise.resolve(200);
            } else {
                res.writeHead(500);
                res.end("");
                return Promise.resolve(500);
            }
        },

        "/": ServerUtils.browserGet,
        "/scripts": ServerUtils.browserGet
    }
};