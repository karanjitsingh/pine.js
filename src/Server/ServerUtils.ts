
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';
import * as uuid from 'uuid';
import * as WebSocket from 'ws';
import { Constants, GetReply, PlatformInstance } from 'Server/ServerContracts';
import { ReporterData } from 'Model/Contracts';
import { Server } from 'Server/Server';

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
        case ".css":
            return "text/stylesheet"
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
