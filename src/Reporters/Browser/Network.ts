export class Network {

    public async get(url: string, params: { [key: string]: string }): Promise<XMLHttpRequest> {
        return await this.send('get', url, "", {}, params);
    }

    public async post(url: string, data: string): Promise<XMLHttpRequest> {
        return await this.send('post', url, data, {}, {});
    }

    private send(method: string, url: string, data: string, headers: { [key: string]: string }, params: { [key: string]: string }): Promise<XMLHttpRequest> {
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
                xhttp.open(method, url + this.paramsToString(params));

                Object.keys(headers).forEach((header) => {
                    xhttp.setRequestHeader(header, headers[header]);
                })

                xhttp.send(data);
            } catch (ex) {
                reject(ex);
            }
        })
    }

    private paramsToString(params: { [key: string]: string }): string {
        return Object.keys(params).reduce((acc: string, current: string) => {
            return (acc != '?' ? (acc + "&") : acc) + `${current}=${params[current]}`;
        }, '?');
    }
}