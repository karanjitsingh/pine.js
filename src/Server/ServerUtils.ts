
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';
import * as WebSocket from 'ws';
import { Constants, GetReply, PlatformConnection } from './ServerContracts';

export function getSocket(platformConnection: PlatformConnection): string {
    const address = `ws://localhost:3001`;
    const path = `/${platformConnection.key}`;

    if (!platformConnection.connection) {
        const websocket = platformConnection.connection = new WebSocket.Server({
            host: 'localhost',
            path,
            port: 3001
        });

        websocket.on('connection', function (socket: WebSocket) {

        });
    }

    return address + path;
}

export function getContentType(file) {
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

export function browserGet(url: URL, res: http.ServerResponse): GetReply {

    let content;
    let file;

    if (url.pathname == '/') {
        file = path.join(Constants.browserBin, "index.html");
    } else {
        file = path.join(Constants.browserBin, url.pathname)
    }

    try {
        content = fs.readFileSync(file).toString()
    }
    catch (ex) {
        res.writeHead(404);
        res.end();
        return Promise.resolve(404);
    }

    res.writeHead(200);
    res.end(content);
    return Promise.resolve(200);
};
