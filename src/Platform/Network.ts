import * as https from 'https';
import { URL } from 'url';
import { INetwork, NetworkResponse } from 'Model/Network';
import { IncomingHttpHeaders } from 'http';
import { Dictionary } from 'Model/Contracts';

export class Network implements INetwork {
    private static requestId: number = 0;

    public async post(url: string, headers: Dictionary<string>, body: string): Promise<NetworkResponse> {

        const requestId = Network.requestId++;

        return new Promise((resolve, reject) => {
            let status: number;
            let headers: IncomingHttpHeaders;
            let data = "";

            var req = https.request(new URL(url), {
                method: 'POST',
                headers: headers,
            }, resp => {
                status = resp.statusCode;
                headers = resp.headers;

                console.log(requestId, "STATUS", status);

                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    data += chunk;
                });

                resp.on('end', function() {
                    if(status != 200) {
                        console.log(requestId, "HEADERS", headers)
                        console.log(requestId, "RESPONSE", data);
                        reject({
                            requestId,
                            status,
                            headers,
                            response: data,
                            error: null
                        } as NetworkResponse);
                    }
                    else {
                        resolve({
                            requestId,
                            status,
                            headers,
                            response: data,
                            error: null
                        } as NetworkResponse);
                    }
                });
            });
            
            req.on('error', function(e) {
                console.log(requestId, "ERROR", e);
                reject({
                    requestId,
                    status,
                    headers,
                    response: data,
                    error: e
                });
            });

            req.write(body);
            req.end();
        });
    }

    public async get(url: string, params: Dictionary<string>): Promise<NetworkResponse> {

        const requestId = Network.requestId++;

        return new Promise((resolve, reject) => {
            let status: number;
            let headers: IncomingHttpHeaders;
            let data = "";
                     
            let search = "";

            if(params && Object.keys(params).length > 0) {
                search = "?" + Object.keys(params).map((key, index, arr) => {
                    return `${key}=${encodeURIComponent(params[key])}${ index + 1 == arr.length ? '' : '&'}`;
                }).join('');
            }

            var req = https.get(new URL(search, url), resp => {
                status = resp.statusCode;
                headers = resp.headers;

                console.log(requestId, "STATUS", status);

                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    data += chunk;
                });

                resp.on('end', function() {
                    if(status != 200) {
                        console.log(requestId, "HEADERS", headers)
                        console.log(requestId, "RESPONSE", data);
                        reject({
                            requestId,
                            status,
                            headers,
                            response: data,
                            error: null
                        } as NetworkResponse);
                    }
                    else {
                        resolve({
                            requestId,
                            status,
                            headers,
                            response: data,
                            error: null
                        } as NetworkResponse);
                    }
                });
            });
            
            req.on('error', function(e) {
                console.log(requestId, "ERROR", e);
                reject({
                    requestId,
                    status,
                    headers,
                    response: data,
                    error: e
                });
            });

        });
    }
}