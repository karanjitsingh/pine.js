import * as http from 'http';
import { GetMethod, PlatformConnection, PostMethod } from 'Server/ServerContracts';
import { URL } from 'url';
import { rest } from './Rest';


export class Server {

    public static platformCollection: { [key: string]: PlatformConnection } = {};
    private static _instance: Server;

    public static getInstance(): Server {
        if (!Server._instance) {
            Server._instance = new Server();
        }

        return Server._instance;
    }

    private constructor() {

    }

    private methodPatternMap: { [method: string]: string[] } = {};

    public start() {

        Object.keys(rest).forEach(method => {
            this.methodPatternMap[method] = Object.keys(rest[method]);
        });

        var server = http.createServer(this.listener);
        server.listen(3000);
    }

    private listener(req: http.IncomingMessage, res: http.ServerResponse) {


        const url = new URL(req.url, "protocol://host");


        const resolver = this.getResolver(req.method.toLowerCase(), url.pathname, this.methodPatternMap);
        if (!resolver) {
            console.log(req.method, req, url, 404);


            res.writeHead(404);
            res.end();
        }
        else {
            const method: GetMethod | PostMethod = rest[req.method.toLowerCase()][resolver];

            console.log(req.method, req, url, req.method.toLowerCase(), resolver);

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

    private getResolver(method: string, pathname: string, map: { [key: string]: string[] }) {
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
}