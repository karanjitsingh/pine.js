import { Page, PageMode } from "Components/Page";
import React = require("react");
import ReactDOM = require("react-dom");
import { BotConfiguration } from "Model/Contracts";

interface InitInfo {
    availableExchanges: string[];
    availableStrategies: string[];
}

export class Network {
    private static requestId: number = 0;

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

const network = new Network();


class Reporter {

    private readonly page: Page;
    private socket: WebSocket;

    constructor() {
        this.page = ReactDOM.render(React.createElement(Page), document.querySelector("#platform-content"));
    }

    public init() {
        network.get('/api/init', {}).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/init', res.status);
            } else {
                try {
                    const info = JSON.parse(res.responseText);
                    this.loadConfigForm(info as InitInfo);
                    console.log(info);
                }
                catch (ex) {
                    console.error('failed', '/api/init', ex);
                }

            }
        }, (why) => {
            console.error('failed', '/api/init', why);
        })
    }

    private loadConfigForm(info: InitInfo) {
        this.page.setState({
            configProps: Object.assign({
                strategySelectCallback: this.strategySelected.bind(this)
            }, info),
            pageMode: PageMode.Configuration
        })
    }

    private strategySelected(config: BotConfiguration) {
        network.post('/api/config', JSON.stringify(config)).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/config', res.status);
            } else {

                const {key, config} = JSON.parse(res.responseText);

                this.page.setState({
                    pageMode: PageMode.Loading
                });

                if (!key) {
                    console.error('platform id was empty');
                }

                console.log(key, config);

                this.subscribeWebSocket(key);
            }
        }, (why) => {
            console.error('failed', 'api/config', why);
        });
    }
    
    private subscribeWebSocket(platformId: string) {
        network.get('/api/datastream', { id: platformId }).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/datastream?id=' + platformId, res.status);
            } else {
                const connection = res.responseText;

                console.log(connection);
                this.subsribe(connection);
            }
        }, (why) => {
            console.error('failed', 'api/config', why);
        });
    }

    private subsribe(connection: string) {
        const ws = this.socket = new WebSocket(connection);
        ws.onmessage = function (ev) {
            console.log(ev.data);
        }

        ws.onerror = function (ev) {
            console.log(ev);
        };
        ws.onopen = function () {
            // showMessage('WebSocket connection established');
        };
        ws.onclose = function () {
            // showMessage('WebSocket connection closed');
            // ws = null;
        };
    }
}

const reporter = new Reporter();

reporter.init();