export interface INetwork {
    get(url: string): Promise<object>;
}


function isNode(): boolean {
    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this; 

    // Create a reference to this
    var _ = new Object();

    var isNode = false;

    // Export the Underscore object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS, add `_` to the
    // global object.
    if (typeof module !== 'undefined' && module.exports) {
            module.exports = _;
            root._ = _;
            isNode = true;
    } else {
            root._ = _;
    }

    return isNode;
}

export class Network {

    public static getNetwork(): INetwork {
        if(isNode()) {
            return new NodeNetwork();
        } else {
            return new BrowserNetwork();
        }
    }
}

class BrowserNetwork implements INetwork {

    private static requestId: number = 0;

    public async get(url: string): Promise<object> {

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
                                reponse: JSON.parse(this.responseText)
                            });
                            break;
                        default:
                            console.log(requestId, "HEADERS", this.getAllResponseHeaders())
                            console.log(requestId, "RESPONSE", this.responseText);
                            reject({
                                requestId,
                                status: this.status,
                                headers: this.getAllResponseHeaders(),
                                reponse: this.responseText
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

class NodeNetwork implements INetwork {
    public async get(url: string): Promise<object> {

        return  Promise.resolve(new Object());
    }
}