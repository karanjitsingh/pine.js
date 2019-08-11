import { INetwork, NetworkResponse } from "./Network";

export class BrowserNetwork implements INetwork {

    private static requestId: number = 0;

    public async get(url: string): Promise<NetworkResponse> {

        const requestId = BrowserNetwork.requestId++;
        
        console.log(requestId, url);

        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                console.log(requestId, "STATUS", this.status);
                
                if (this.readyState == 4) {
                    switch(this.status) {
                        case 200:
                            resolve({
                                requestId,
                                status: this.status,
                                headers: this.getAllResponseHeaders(),
                                reponse: JSON.parse(this.responseText),
                                error: null
                            });
                            break;
                        default:
                            console.log(requestId, "HEADERS", this.getAllResponseHeaders())
                            console.log(requestId, "RESPONSE", this.responseText);
                            reject({
                                requestId,
                                status: this.status,
                                headers: this.getAllResponseHeaders(),
                                reponse: this.responseText,
                                error: null
                            })
                            break;
                    }
                }
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        });
    }
}