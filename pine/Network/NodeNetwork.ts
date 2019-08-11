import { INetwork, NetworkResponse } from "./Network";
import * as http from 'http';
import { URL } from 'url';

export class NodeNetwork implements INetwork {
    private static requestId: number = 0;

    public async get(url: string): Promise<NetworkResponse> {

        const requestId = NodeNetwork.requestId++;
        const urlObj = new URL(url);

        return new Promise((resolve, reject) => {
            let status;
            let headers;
            let data = "";
            
            var options = {
                host: urlObj.origin,
                port: 80,
                path: urlObj.pathname,
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                }
            };
                        
            var req = http.request(options, function(res) {
                status = res.statusCode;
                headers = res.headers;

                console.log(requestId, "STATUS", status);

                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    data += chunk;
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
            
            req.end();

            if(status != 200) {
                console.log(requestId, "HEADERS", headers)
                console.log(requestId, "RESPONSE", data);
                resolve({
                    requestId,
                    status,
                    headers,
                    response: data,
                    error: null
                });
            }
            else {
                reject({
                    requestId,
                    status,
                    headers,
                    response: data,
                    error: null
                });
            }
        });
    }
}