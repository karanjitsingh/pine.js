import * as http from 'http';
import * as fs from 'fs';
import { Platform } from 'Platform/Platform';
import * as path from 'path';
import { BotConfiguration } from 'Model/Contracts';
import { URL } from 'url';
import { Strategy } from 'Model/Strategy/Strategy';
import { Exchange } from 'Model/Exchange/Exchange';
import * as uuid from 'uuid/v4';

import * as WebSocket from 'ws';

type RestMethods = {
    'post': { [path: string]: PostMethod },
    'get': { [path: string]: GetMethod }
}

type PostReply = Promise<number>;
type GetReply = Promise<number>;

type PostMethod = (url: URL, body: any, res: http.ServerResponse) => PostReply;
type GetMethod = (url: URL, res: http.ServerResponse) => GetReply;

const pineBin = path.join(path.dirname(__dirname), "out");
const browserBin = path.join(path.dirname(__dirname), "out", "Reporters", "Browser")

interface PlatformConnection {
    key: string,
    platform: Platform,
    connections: {[key:string]: WebSocket.Server}
}

const platformCollection: {[key: string]: PlatformConnection } = {};

export class PineServer {

    private static methodPatternMap: { [method: string]: string[] } = {};

    public static start() {

        Object.keys(PineServer.rest).forEach(method => {
            PineServer.methodPatternMap[method] = Object.keys(PineServer.rest[method]);
        });

        var server = http.createServer(PineServer.listener);
        server.listen(3000);
    }

    private static listener(req: http.IncomingMessage, res: http.ServerResponse) {


        const url = new URL(req.url, "protocol://host");


        const resolver = getResolver(req.method.toLowerCase(), url.pathname, PineServer.methodPatternMap);
        if (!resolver) {
            console.log(req.method, req,url, 404);


            res.writeHead(404);
            res.end();
        }
        else {
            const method: GetMethod | PostMethod = PineServer.rest[req.method.toLowerCase()][resolver];

            console.log(req.method, req,url, req.method.toLowerCase(), resolver);

            switch (req.method.toLowerCase()) {
                case 'get':
                    (method as GetMethod)(url, res);
                    break;
                case 'post':
                    let body: any = [];
                    req.on('error', (err) => {
                        console.error(err);
                    }).on('data', (chunk) => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();

                        let data = null;

                        try {
                            data = JSON.parse(body);
                        } catch (e) {
                            res.writeHead(400);
                            res.end();
                        }
                        
                        if (data) {
                            (method as PostMethod)(url, data, res);
                        }

                    });
                    break;
                default:
                    res.writeHead(405);
                    res.end();
            }
        }
    }


    private static rest: RestMethods = {
        'post': {
            '/api/config': (url: URL, config: BotConfiguration, res: http.ServerResponse): PostReply => {
                if (!Validations.ValidateBotConfig(config)) {
                    res.writeHead(400);
                    res.end();
                    return Promise.resolve(400);
                }

                const platFormKey = uuid();
                platformCollection[platFormKey] = {
                    key: platFormKey,
                    platform: new Platform(config),
                    connections: {}
                };

                res.writeHead(200);
                res.end(platFormKey);
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
                const file = path.join(pineBin, url.pathname.replace("/pine", ""));

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
                                "Content-Type": getContentType(file)
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

            '/api/datastream': (url:URL, res:http.ServerResponse): GetReply => {

                const id = url.searchParams.get('id');

                
                if(!id || !platformCollection[id]) {
                    res.writeHead(400);
                    res.end();
                    return Promise.resolve(400);
                }
                
                const platformConnection = platformCollection[id];

                const address = getSocket(platformConnection);

                res.writeHead(200);
                res.end(address);
                return Promise.resolve(200);
            },

            '/': browserGet,
            '/lib': browserGet
        }
    }
}

function getSocket(platformConnection: PlatformConnection): string {
    const socketId = uuid();
    const address = `ws://localhost:3001`;
    const path = `/${platformConnection.key}/${socketId}`;

    const websocket = platformConnection.connections[socketId] = new WebSocket.Server({
        host: 'localhost',
        path,
        port: 3001
    });

    websocket.on('connection', function(socket: WebSocket) {
        socket.send(Array(1000000).fill('a').join(''));
    });

    return address + path;
}

function getContentType(file) {
    const ext = path.extname(file);
    switch (ext) {
        case ".js":
            return "script/typescript";
        case ".ts":
            return "script/javascript";
        case ".map":
            return "text/json";
        case ".html":
            return "text/html";
    }
}

function browserGet(url: URL, res: http.ServerResponse): GetReply {

    let content;
    let file;

    if(url.pathname == '/') {
        file = path.join(browserBin, "index.html");
    } else {
        file = path.join(browserBin, url.pathname)
    }

    try {
        content = fs.readFileSync(file).toString()
    }
    catch(ex) {
        res.writeHead(404);
        res.end();
        return Promise.resolve(404);
    }

    res.writeHead(200);
    res.end(content);
    return Promise.resolve(200);
};


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

const getResolver = (method: string, pathname: string, map: { [key: string]: string[] }) => {
    const paths = map[method];

    if (paths) {
        for (let i = 0; i < paths.length; i++) {
            if (pathname.startsWith(paths[i])) {
                return paths[i];
            }
        }
    }

    return null;
}