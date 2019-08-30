import * as fs from 'fs';
import * as http from 'http';
import { BotConfiguration } from "Model/Contracts";
import { Exchange } from "Model/Exchange/Exchange";
import { Strategy } from "Model/Strategy/Strategy";
import * as path from 'path';
import { Platform } from "Platform/Platform";
import { Server } from "Server/Server";
import { Constants, GetReply, PostReply, RestMethods } from "Server/ServerContracts";
import * as ServerUtils from 'Server/ServerUtils';
import { URL } from "url";
import * as uuid from 'uuid/v4';

export const rest: RestMethods = {
    'post': {
        '/api/config': (url: URL, config: BotConfiguration, res: http.ServerResponse): PostReply => {
            if (!Validations.ValidateBotConfig(config)) {
                res.writeHead(400);
                res.end();
                return Promise.resolve(400);
            }

            const platFormKey = uuid();
            const platform = new Platform(config);

            Server.platformCollection[platFormKey] = {
                key: platFormKey,
                platform,
                connection: null
            };

            res.writeHead(200);
            res.end(JSON.stringify({
                key: platFormKey,
                config: platform.getStrategyConfig()
            }));
            return Promise.resolve(200);
        }
    },
    'get': {
        '/api/init': (url: URL, res: http.ServerResponse): GetReply => {
            res.writeHead(200);
            res.end(JSON.stringify({
                availableStrategies: Strategy.GetRegisteredStrategies(),
                availableExchanges: Exchange.GetRegisteredExchanges()
            }))

            return Promise.resolve(200);
        },
        '/pine': (url: URL, res: http.ServerResponse): GetReply => {
            const file = path.join(Constants.pineBin, url.pathname.replace("/pine", ""));

            if (fs.existsSync(file)) {
                fs.readFile(file, (err, content) => {
                    if (err) {
                        res.writeHead(500, {
                            "Content-Type": "text/HTML"
                        });

                        res.end(err.toString());
                        return Promise.resolve(500);
                    }
                    else {
                        res.writeHead(200, {
                            "Content-Type": ServerUtils.getContentType(file)
                        });

                        res.end(content);
                        return Promise.resolve(200);
                    }
                });
            }
            else {
                res.writeHead(404)
                res.end();
                return Promise.resolve(404);
            }
        },

        '/api/datastream': (url: URL, res: http.ServerResponse): GetReply => {
            const id = url.searchParams.get('id');

            if (!id || !Server.platformCollection[id]) {
                res.writeHead(400);
                res.end();
                return Promise.resolve(400);
            }

            const platformConnection = Server.platformCollection[id];

            const address = ServerUtils.getSocket(platformConnection);

            res.writeHead(200);
            res.end(address);
            return Promise.resolve(200);
        },

        '/': ServerUtils.browserGet,
        '/lib': ServerUtils.browserGet
    }
}

const Validations = {
    ValidateBotConfig: (config: BotConfiguration) => {
        if (!config) {
            return false;
        }

        if (!config.Exchange || !config.Strategy || !(!!config.BacktestSettings || !!config.TradeSettings)) {
            return false;
        }

        return true;
    }
}