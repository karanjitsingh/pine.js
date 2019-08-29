import * as http from 'http';
import * as fs from 'fs';
import { Platform } from 'Platform/Platform';
import * as path from 'path';
import { BotConfiguration } from 'Model/Contracts';
import { URL, Url } from 'url';

type RestMethods = {
    'post': { [pattern: string]: PostMethod },
    'get': { [pattern: string]: GetMethod }
}

type Response = {
    status: number,
    headers?: { [key: string]: string }
}

type PostReply = Promise<Response>;
type GetReply = [Promise<Response>, Promise<string>];

type PostMethod = (url: URL, body: any) => PostReply;
type GetMethod = (url: URL) => GetReply;

const pineBin = path.join(path.dirname(__dirname), "pine", "bin");

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

const platform = new Platform();

export class PineServer {

    private static methodPatternMap: { [method: string]: string[] } = {};

    public static start() {

        Object.keys(PineServer.rest).forEach(method => {
            PineServer.methodPatternMap[method] = Object.keys(PineServer.rest[method]);
        });

        console.log(PineServer.methodPatternMap);

        var server = http.createServer(PineServer.listener);
        server.listen(3000);
    }

    private static listener(req: http.IncomingMessage, res: http.ServerResponse) {


        const url = new URL(req.url, "protocol://host");
        console.log(req.method, url.pathname, url.searchParams);


        const resolver = getResolver(req.method.toLowerCase(), url.pathname, PineServer.methodPatternMap);
        if (!resolver) {
            res.writeHead(404);
            res.end();
        }
        else {
            const method: GetMethod | PostMethod = PineServer.rest[req.method.toLowerCase()][resolver];

            switch (req.method.toLowerCase()) {
                case 'get':
                    method.call(null, [url]);
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
                            data = JSON.parse(body)
                        } catch (e) {
                            res.writeHead(400);
                            res.end();
                        }

                        if (data) {
                            method(url, data);
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
            '/config': (url: URL, config: BotConfiguration): PostReply => {

                if (!Validations.ValidateBotConfig(config)) {
                    return Promise.resolve({
                        status: 400
                    });
                }

                platform.setConfig(config);

                return Promise.resolve({
                    status: 200
                });
            }
        },
        'get': {
            '/pine': (url: URL): GetReply => {
                const file = path.join(pineBin, url.pathname.replace("/pine", ""));

                let setContent;
                let setHeaders;

                const response = new Promise<string>((resolve) => { setContent = resolve; });
                const headers = new Promise<Response>((resolve) => { setHeaders = resolve; });

                if (fs.existsSync(file)) {
                    fs.readFile(file, (err, content) => {
                        if (err) {

                            setHeaders({
                                status: 500,
                                headers: {
                                    "Content-Type": "text/HTML"
                                }
                            })

                            setContent(err.toString());
                        }
                        else {
                            setHeaders({
                                status: 200,
                                headers: {
                                    "Content-Type": getContentType(file)
                                }
                            });

                            setContent(content);
                        }
                    });
                }
                else {
                    setHeaders({
                        status: 400
                    });
                    setContent("");
                }

                return [headers, response];
            },

            '/': (url: URL): GetReply => {
                return [Promise.resolve({ status: 200 }), Promise.resolve(fs.readFileSync(path.join(__dirname, "Reporters", "Browser", "index.html")).toString())]
            }
        }
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