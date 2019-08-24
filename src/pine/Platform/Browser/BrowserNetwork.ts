import { INetwork, NetworkResponse } from "Model/Platform/Network";
import { promises } from "dns";

export class BrowserNetwork implements INetwork {

    private static requestId: number = 0;

    public async get(url: string): Promise<NetworkResponse> {

        const requestId = BrowserNetwork.requestId++;

        console.log(requestId, url);

        return new Promise((resolve, reject) => {
            const request = new ProxyRequest();
            request.send('GET', url, {}).then((req) => {
                console.log(requestId, "STATUS", req.status);

                switch (req.status) {
                    case 200:
                        resolve({
                            requestId,
                            status: req.status,
                            headers: req.getAllResponseHeaders(),
                            response: req.responseText,
                            error: null
                        } as NetworkResponse);
                        break;
                    default:
                        console.log(requestId, "HEADERS", req.getAllResponseHeaders());
                        console.log(requestId, "RESPONSE", req.responseText);
                        reject({
                            requestId,
                            status: req.status,
                            headers: req.getAllResponseHeaders(),
                            response: req.responseText,
                            error: null
                        } as NetworkResponse);
                        break;
                }
            }, (type) => {
                console.log(requestId, 'network error', 'type:' + type);
            })
        });
    }
}

class ProxyRequest {

    public send(method: string, url: string, headers: { [key: string]: string }): Promise<XMLHttpRequest> {
        const wrappedHeaders = JSON.stringify(headers);

        const xhttp = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    resolve(this);
                }
            }

            xhttp.onabort = () => {
                reject('abort');
            };

            xhttp.ontimeout = () => {
                reject('timeout');
            };

            xhttp.onerror = () => {
                reject('error');
            };

            try {
                xhttp.open(method, "/proxy?url=" + encodeURIComponent(url), true);
                xhttp.setRequestHeader("pine-wrapped-headers", wrappedHeaders);
                xhttp.send();
            } catch (ex) {
                reject(ex);
            }
        })
    }
}