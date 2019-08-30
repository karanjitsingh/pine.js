
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';
import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { Constants, GetReply, PlatformConnection } from './ServerContracts';
import { ReporterData } from 'Model/Contracts';
import { Server } from 'Server/Server';

export function getSocket(platformConnection: PlatformConnection): string {
    const address = `ws://localhost:3001`;
    const path = `/${platformConnection.key}`;

    if (!platformConnection.server) {
        const websocket = platformConnection.server = new WebSocket.Server({
            host: 'localhost',
            path,
            port: 3001
        });

        websocket.on('connection', function (socket: WebSocket) {
            const key = uuid();

            if(!platformConnection.platform.isRunning) {
                platformConnection.platform.start();
                platformConnection.platform.subscribe((data: ReporterData) => {
                    updateData(data, platformConnection.key);
                }, null);
            }
            
            platformConnection.connections[key] = socket;

            socket.onclose = () => {
                delete platformConnection.connections[key];
            }
        });
    }

    return address + path;
}

function updateData(data: ReporterData, key: string) {
    Object.values(Server.platformCollection[key].connections).forEach((socket: WebSocket) => {
        socket.send(JSON.stringify(data));
    });
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
