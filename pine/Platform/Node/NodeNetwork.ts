import * as https from 'https';
import { URL } from 'url';
import { INetwork, NetworkResponse } from '../../Model/Platform/Network';

export class NodeNetwork implements INetwork {
    private static requestId: number = 0;

    public async get(url: string): Promise<NetworkResponse> {

        const requestId = NodeNetwork.requestId++;
        const urlObj = new URL(url);

        return new Promise((resolve, reject) => {
            let status;
            let headers;
            let data = "";
                        
            var req = https.get(new URL(url), resp => {
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